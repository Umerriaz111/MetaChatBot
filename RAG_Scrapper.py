
import os
import glob
import pandas as pd
from scrapegraphai.graphs import SmartScraperGraph
from langchain.schema import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_models import ChatOllama
from langchain_core.runnables import RunnablePassthrough
from langchain.retrievers.multi_query import MultiQueryRetriever

# Define the configuration for the scraping pipeline
graph_config = {
   "llm": {
       "api_key": "",
       "model": "openai/gpt-4o-mini",
   },
   "verbose": True,
   "headless": False,
}

# Step 1: Run the Scraper
smart_scraper_graph = SmartScraperGraph(
    prompt="Extract Product Name ,Price  rating and Reviews.",
    source="https://www.amazon.com/Shoes-Under-10/s?k=Shoes+Under+%2410",
    config=graph_config
)
result = smart_scraper_graph.run()

# Step 2: Save to Excel (Dynamically)
def save_to_excel(result):
    if not result:
        print("No data found.")
        return None

    category_key = list(result.keys())[0]  # Extract dynamic key (e.g., "shoes_under_10")
    extracted_data = result[category_key]

    if extracted_data and isinstance(extracted_data, list):
        df = pd.DataFrame(extracted_data)
        output_file = f"{category_key}.xlsx"  # Name based on category
        df.to_excel(output_file, index=False)
        print(f"Data successfully saved to {output_file}")
        return output_file
    else:
        print("No valid data found to save.")
        return None

latest_file = save_to_excel(result)

# Step 3: Dynamically Load Latest Excel File
def load_latest_excel():
    files = glob.glob("*.xlsx")  # Find all Excel files
    if not files:
        raise FileNotFoundError("No Excel files found!")
    return max(files, key=os.path.getctime)  # Get the latest file

latest_file = load_latest_excel()
df = pd.read_excel(latest_file, engine='openpyxl')
print(f"Loaded file: {latest_file}")
print(df.head())  # Preview data

# Step 4: Convert Data to LangChain Document Format
documents = []
for _, row in df.iterrows():
    row_data = "\n".join([f"{col}: {row[col]}" for col in df.columns])
    documents.append(Document(page_content=row_data))

# Step 5: Chunk Data for Vector Storage
text_splitter = RecursiveCharacterTextSplitter(chunk_size=7500, chunk_overlap=100)
chunks = text_splitter.split_documents(documents)

# Step 6: Store in Vector Database (Chroma)
vector_db = Chroma.from_documents(
    documents=chunks, 
    embedding=OllamaEmbeddings(model="nomic-embed-text", show_progress=True),
    collection_name="local-rag"
)

# Step 7: Configure LLM and Retriever
local_model = "mistral"
llm = ChatOllama(model=local_model)

QUERY_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""You are an AI assistant helping users find shoes under $10. Generate five alternative queries 
    to improve search results, considering name, price, rating, reviews, delivery, and shipping details.
    
    Original question: {question}"""
)

retriever = MultiQueryRetriever.from_llm(
    vector_db.as_retriever(), 
    llm,
    prompt=QUERY_PROMPT
)

# Step 8: Define RAG Prompt
template = """Answer the question based ONLY on the following context:
{context}
Question: {question}
"""

prompt = ChatPromptTemplate.from_template(template)

# Step 9: Create Chat Pipeline
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# Step 10: Query Example (Unlimited Chatting Enabled)
while True:
    user_query = input("\nAsk about shoes under $10 (or type 'exit' to quit): ")
    if user_query.lower() == "exit":
        break
    response = chain.invoke(user_query)
    print("\nAI Response:\n", response)