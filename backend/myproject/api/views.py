from django.shortcuts import render
import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from langchain_community.utilities import SearxSearchWrapper

from rest_framework import generics, permissions
from django.contrib.auth.models import User
from .models import ChatSession, Message
from .serializers import UserSerializer, ChatSessionSerializer, MessageSerializer
from rest_framework.exceptions import ValidationError

from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import openai
import os
from dotenv import load_dotenv
import json
from langchain_community.tools.searx_search.tool import SearxSearchResults
from langchain_community.utilities.searx_search import SearxSearchWrapper

load_dotenv()

# User Views
class UserList(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# ChatSession Views
class ChatSessionList(generics.ListCreateAPIView):
    queryset = ChatSession.objects.all()
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.AllowAny] # permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # The 'user' field is automatically set in the serializer
        serializer.save()

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')  # Get user_id from request body
        if not user_id:
            raise ValidationError({"error": "User ID is required."})  # Return an error if user_id is missing
        return ChatSession.objects.filter(user_id=user_id)  # Filter by user_id

class ChatSessionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChatSession.objects.all()
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.AllowAny] # permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        session_id = self.kwargs.get('pk')  # 'pk' is the session ID passed in the URL
        try:
            return ChatSession.objects.get(id=session_id)
        except ChatSession.DoesNotExist:
            raise ValidationError({"error": "Chat session not found."})

    def destroy(self, request, *args, **kwargs):
        session = self.get_object()
        session.delete()  # Deletes the session
        return Response({"message": "Chat session deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        session = self.get_object()
        # Check if the name is being updated
        session_name = request.data.get('session_name', None)
        if session_name:
            session.session_name = session_name
            session.save()
            return Response({"message": "Chat session renamed successfully."}, status=status.HTTP_200_OK)
        return Response({"error": "Session name field is required."}, status=status.HTTP_400_BAD_REQUEST)

# Message Views
class MessageList(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.AllowAny] # permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter messages by the session ID in the URL
        session_id = self.kwargs['session_id']
        return Message.objects.filter(session_id=session_id)

    def get_serializer_context(self):
        # Pass the session object to the serializer context
        context = super().get_serializer_context()
        session_id = self.kwargs['session_id']
        context['session'] = ChatSession.objects.get(id=session_id)
        return context
    
    def post(self, request, *args, **kwargs):
        query = request.GET.get('query')
        number_of_items = int(request.GET.get('number_of_items', 0))
        engines = [engine.lower() for engine in request.GET.get('engines', 'google,duckduckgo,yahoo,bing,wikipedia,github,yandex,ecosia,mojeek').split(',')]
        # query_type = request.GET.get('query_type', 'searching')  # Default to 'searching' if not specified
        message_type = request.GET.get('message_type', 'searching')  # Default to 'searching' if not specified
        
        if message_type not in ['searching', 'scraping']:
            return Response({"message": "Invalid message_type. Must be either 'searching' or 'scraping'"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not query or query == '':
            return Response({"message": "Either Query not sent or Query is empty"})
        
        if not engines or engines == ['']:
            engines = [engine.lower() for engine in 'google,duckduckgo,yahoo,bing,wikipedia,github,yandex,ecosia,mojeek'.split(',')]

        if message_type == 'searching':

            llm_response = assistant2(query)

            # if llm_response == 'not safe':
            #     return Response({"results": []})

            # Extract session from URL
            session_id = self.kwargs['session_id']
            session = ChatSession.objects.get(id=session_id)

            # Extract user message and generate chatbot response
            user_message = query
            if llm_response != 'not safe':
                chatbot_response = search_results(user_message, number_of_items, engines)
            else:
                chatbot_response = 'Search results are not safe. Please try again.'

            # Save message to DB
            message = Message.objects.create(
                session=session,
                user_message=user_message,
                chatbot_response=chatbot_response,
                message_type=message_type
            )

            # Return response
            return Response({
                "id": message.id,
                "user_message": message.user_message,
                "chatbot_response": message.chatbot_response,
                "created_at": message.created_at,
                "message_type": message.message_type
            }, status=status.HTTP_201_CREATED)
        
        else:
            return Response({"message": f"You selected scraping as your message_type. and your query was {query}"}, status=status.HTTP_200_OK)


class MessageDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

def websearch(query,engine='google',pageno=1):
    try:
        searxng_url = 'http://127.0.0.1:8080/search'
 
        params = {
            'q': query,
            'format': 'json',
            'pageno':pageno,
            'engines':engine
        }
        
        response = requests.get(searxng_url, params=params)
        response.raise_for_status()
        results = response.json()
        return results

    except Exception as e:
        print(f'Exception in websearch = {str(e)}')
        return None
    
def assistant2(query):
    # Set up OpenAI GPT-4o Mini model
    os.environ["OPENAI_API_KEY"] = os.getenv('OPENAI_API_KEY')

    # Use ChatOpenAI for GPT-4o Mini
    llm = ChatOpenAI(model="gpt-4o", temperature=0.7)
    prompt_template = PromptTemplate(
        input_variables=["query"],
        template="""
        You are a helpful and ethical assistant whose task is to check user queries and verify if its an ethical and non dangerous query. If the query is unethical or dangerous then respond with 'safe' else respond with 'not safe'
        Queries which include sensitive content such as adult movies, illegal content, prohibited content, or banned content is considered not unethical. You should reply with 'not safe' in this case.
        User Query: {query} """
    )

    chain = LLMChain(llm=llm, prompt=prompt_template)

    response = chain.run(query=query)
    print(f"Response from GPT-4o Mini: {response}")
    return response


def assistant(query,search_results):
    
    # Set up OpenAI GPT-4o Mini model
    os.environ["OPENAI_API_KEY"] = os.getenv('OPENAI_API_KEY')

    # Use ChatOpenAI for GPT-4o Mini
    llm = ChatOpenAI(model="gpt-4o", temperature=0.7)
    prompt_template = PromptTemplate(
        input_variables=["query", "search_results"],
        template="""
        You are a helpful and ethical assistant that gathers data from different browsers and presents it in a structured manner.
        Do not respond to queries which include sensitive content such as adult movies, illegal content, prohibited content, or banned content. You should say sorry I can't help you with that in that case.
        User Query: {query}

        Below are the search results from different browsers:
        {search_results}

        Extract the relevant information and return a JSON array where each item contains:
        - `browser`: Name of the browser source
        - `title`: Title of the search result
        - `snippet/content`: A short summary of the search result
        - `link`: The URL of the search result

        Ensure the response is valid JSON and follows this format exactly where it should be a list of dictionaries. Do not add anything additional to it like ``` or json or ``` :

        
        [
            {{"browser": "<Browser Name>", "title": "<Title>", "content": "<Snippet>", "link": "<URL>"}},
            {{"browser": "<Browser Name>", "title": "<Title>", "content": "<Snippet>", "link": "<URL>"}}
        ]
        

        If no relevant results are found, return an empty JSON array `[]`.
        """
    )

    chain = LLMChain(llm=llm, prompt=prompt_template)

    # Check for sensitive content
    sensitive_keywords = ["adult movies", "illegal", "prohibited", "banned"]
    if any(keyword in query.lower() for keyword in sensitive_keywords):
        return []

    response = chain.run(query=query, search_results=search_results)
    print(f"Response from GPT-4o Mini: {response}")

    # Ensure response is a valid JSON list of dictionaries
    try:
        structured_response = json.loads(response)
        if isinstance(structured_response, list):
            return structured_response
        else:
            return []  # Return empty list if unexpected format
    except json.JSONDecodeError:
        return []  # Return empty list if parsing fails




@api_view(['GET','POST'])
def search(request):
    if request.method == 'GET':
        query = request.GET.get('query')
        if not query:
            return Response('Query parameter is missing', status=status.HTTP_400_BAD_REQUEST)

        # Log the query for debugging
        print(f"Received query: {query}")
        
        searxng_url = 'http://127.0.0.1:8080/search'
        data = {
            'q': query,
            'format': 'json',
            'category': 'general',  # Optional: specify categories if needed
        }
        
        try:
            # Send POST request to the search engine (SearxNG)
            response = requests.post(searxng_url, data=data)
            response.raise_for_status()  # This will raise an HTTPError for bad responses
            
            # Parse the response JSON
            results = response.json()
            
            # Return the results as a Response
            return Response(results, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            # Log the error and return a 500 status for request-related errors
            print(f"Request error: {str(e)}")
            return Response(f'Error during search request: {e}', status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except ValueError as e:
            # Handle JSON parsing errors
            print(f"JSON parsing error: {str(e)}")
            return Response(f'Error parsing response: {e}', status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            # Catch any other exceptions and log
            print(f"Unexpected error: {str(e)}")
            return Response(f'An unexpected error occurred: {e}', status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        query = request.GET.get('query')
        number_of_items = int(request.GET.get('number_of_items',10))
        engines = [engine.lower() for engine in request.GET.get('engines', 'google,duckduckgo').split(',')]
        print(f"Received query: {query}")
        print(f"Received number_of_items: {number_of_items}")
        print(f"Received engines: {engines}")
        
        # Data Prep for LLM
        data_for_llm = []
        for engine in engines:
            results = websearch(query, number_of_items, engine)
            if not results:
                continue
            
            for result in results:
                data_for_llm.append({
                    "browser": engine,
                    "title": result.get('title', 'N/A'),
                    "link": result.get('link', 'N/A'),
                    "snippet": result.get('snippet', 'N/A')
                })

        if not data_for_llm:
            return Response({"message": "Sorry, no relevant search results found."}, status=status.HTTP_404_NOT_FOUND)

        # Convert results into a JSON string to pass to GPT
        llm_response = assistant(query, json.dumps(data_for_llm))

        return Response({"results": llm_response}, status=status.HTTP_200_OK)

def search_results(query, number_of_items, engines):
    final_result = []

    for engine in engines:
        pageno = 1
        result_of_each_engine = []
        
        while pageno <= 20:
            response = websearch(query, engine, pageno)
            response = response['results']
            result_of_each_engine.extend(response)
            
            if response == []:
                break  # Stop if there are no more results
            
            if number_of_items > 0 and len(result_of_each_engine) >= number_of_items:
                result_of_each_engine = result_of_each_engine[:number_of_items]
                break
            
            pageno += 1
        
        final_result.extend(result_of_each_engine)

    return final_result


@api_view(['GET','POST'])
def search2(request):
    query = request.GET.get('query')
    number_of_items = int(request.GET.get('number_of_items', 0))
    engines = [engine.lower() for engine in request.GET.get('engines', 'google,duckduckgo,yahoo,bing,wikipedia,github,yandex,ecosia,mojeek').split(',')]
    query_type = request.GET.get('query_type', 'searching')  # Default to 'searching' if not specified
    
    print(f"Received query: {query}")
    print(f"Received number_of_items: {number_of_items}")
    print(f"Received engines: {engines}")
    print(f"Received query_type: {query_type}")

    if query_type not in ['searching', 'scraping']:
        return Response({"message": "Invalid query_type. Must be either 'searching' or 'scraping'"}, status=status.HTTP_400_BAD_REQUEST)

    if not query or query == '':
        return Response({"message": "Either Query not sent or Query is empty"})
    
    if not engines or engines == ['']:
        engines = [engine.lower() for engine in 'google,duckduckgo,yahoo,bing,wikipedia,github,yandex,ecosia,mojeek'.split(',')]

    llm_response = assistant2(query)

    if llm_response == 'not safe':
        return Response({"results": []})
    
    final_result = []

    for engine in engines:
        pageno = 1
        result_of_each_engine = []
        
        while pageno <= 20:
            response = websearch(query, engine, pageno)
            response = response['results']
            result_of_each_engine.extend(response)
            
            if response == []:
                break  # Stop if there are no more results
            
            if number_of_items > 0 and len(result_of_each_engine) >= number_of_items:
                result_of_each_engine = result_of_each_engine[:number_of_items]
                break
            
            pageno += 1
        
        final_result.extend(result_of_each_engine)
        print(f"\n\n len of Result from {engine}: {len(result_of_each_engine)}")

    return Response({
        'results': final_result,
        'query_type': query_type
    }, status=status.HTTP_200_OK)
