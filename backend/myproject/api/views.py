from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from langchain_community.utilities import SearxSearchWrapper

# Create your views here.
# @api_view(['GET'])
# def search(request):
#     if request.method == 'GET':
#         try:
#             search = SearxSearchWrapper(searx_host="http://127.0.0.1:8080")
#             query = request.GET.get('query')
#             response = search.run(query)
#             return Response(response)
#         except Exception as e:
#             return Response(f'Error due to {e}',status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
def search(request):
    if request.method == 'GET':
        try:
            query = request.GET.get('query')
            if not query:
                return Response('Query parameter is missing', status=status.HTTP_400_BAD_REQUEST)

            # Log the query for debugging
            print(f"Received query: {query}")
            

            search = SearxSearchWrapper(searx_host="http://127.0.0.1:8080")
            response = search.run(query)
            output={"response":response}
            print( "This is response", output)
            return Response(output)
        except Exception as e:
            print(f"Error: {str(e)}")  # Log the error for debugging
            return Response(f'Error due to {e}', status=status.HTTP_400_BAD_REQUEST)