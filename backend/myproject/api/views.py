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

from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import openai
import os
from dotenv import load_dotenv

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
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # The 'user' field is automatically set in the serializer
        serializer.save()

    def get_queryset(self):
        # Only return chat sessions for the currently authenticated user
        return ChatSession.objects.filter(user=self.request.user)

class ChatSessionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChatSession.objects.all()
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

# Message Views
class MessageList(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

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

class MessageDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

def websearch(query,number_of_items=3,engine='google'):
    try:
        search = SearxSearchWrapper(searx_host="http://127.0.0.1:8080", engines=[engine])
        results = search.results(query, num_results=number_of_items)
        return results
    except Exception as e:
        print(f'Exception in websearch = {str(e)}')
        return None

def assistant(query,search_results):
    
    # Set up OpenAI GPT-4o Mini model
    os.environ["OPENAI_API_KEY"] = os.getenv('OPENAI_API_KEY')

    # Use ChatOpenAI for GPT-4o Mini
    llm = ChatOpenAI(model="gpt-4o", temperature=0.7)
    prompt_template = PromptTemplate(
    input_variables=["query", "search_results"],
    template="""
    You are a helpful and ethical assistant that gathers data from different browsers and presents it in a structured manner.

    User Query: {query}

    Below are the search results from different browsers:
    {search_results}

    Extract the relevant information and present it in the following structured format by replacing <Browser Name> with the provided browser name:
    - **<Browser Name> Results:**
    - Title: ...
    - Snippet: ...
    - Link: ...

    Ensure the response is well-organized and readable. If the query contains sensitive content (e.g., adult movies, illegal activities), politely refuse to answer and apologize.
        """
    )

    chain = LLMChain(llm=llm, prompt=prompt_template)
    # Check for sensitive content
    sensitive_keywords = ["adult movies", "illegal", "prohibited", "banned"]
    if any(keyword in query.lower() for keyword in sensitive_keywords):
        return "Sorry, I can't help you with this query."
    
    response = chain.run(query=query, search_results=search_results)
    return response




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
        number_of_items = request.GET.get('number_of_items',3)
        engines = request.GET.get('engines',['google','duckduckgo'])
        
        # Data Prep for LLM
        data_for_llm = ''
        for engine in engines:
            single_browser_result = f'''The result from {engine} browser is\n'''
            results = websearch(query,number_of_items,engine)
            print(f'results = {results}')
            if not results:
                continue
            
            # Convert results (which is a list of dictionaries) to a string
            for index,result in enumerate(results):
                title = result.get('title', 'N/A')
                link = result.get('link', 'N/A')
                snippet = result.get('snippet', 'N/A')
                result_str = f"Result Number {index+1} = Title: {title} Link: {link} Snippet: {snippet}"
                single_browser_result += result_str

            data_for_llm += single_browser_result

        if not data_for_llm:
            return Response("Sorry, I couldn't find any relevant search results for your query." )
        
        # Giving data to LLM
        llm_response = assistant(query,data_for_llm)
        return Response(llm_response, status=status.HTTP_200_OK)