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
from dotenv import load_dotenv

def initialize_environment():
    """Initialize environment variables and configurations."""
    load_dotenv()
    return {
        "llm": {
            "api_key": os.getenv("OPENAI_API_KEY"),
            "model": "openai/gpt-4o-mini",
        },
        "verbose": True,
        "headless": False,
    }

def scrape_data(config,prompt,source):
    """Run the scraper to collect Amazon product data."""
    smart_scraper_graph = SmartScraperGraph(
        prompt=prompt,
        source=source,
        config=config
    )
    return smart_scraper_graph.run()

def save_to_excel(result):
    """Save scraped data to Excel file."""
    if not result:
        print("No data found.")
        return None

    category_key = list(result.keys())[0]
    extracted_data = result[category_key]

    if extracted_data and isinstance(extracted_data, list):
        df = pd.DataFrame(extracted_data)
        output_file = f"{category_key}.xlsx"
        df.to_excel(output_file, index=False)
        print(f"Data successfully saved to {output_file}")
        return output_file
    else:
        print("No valid data found to save.")
        return None

def load_latest_excel():
    """Load the most recent Excel file."""
    files = glob.glob("*.xlsx")
    if not files:
        raise FileNotFoundError("No Excel files found!")
    return max(files, key=os.path.getctime)

def convert_to_documents(df):
    """Convert DataFrame to LangChain Document format."""
    documents = []
    for _, row in df.iterrows():
        row_data = "\n".join([f"{col}: {row[col]}" for col in df.columns])
        documents.append(Document(page_content=row_data))
    return documents

def convert_string_to_document(text):
    """Convert a string into a LangChain Document.
    
    Args:
        text (str): The text content to convert into a document
        
    Returns:
        Document: A LangChain Document object containing the text
    """
    return Document(page_content=text)

def create_text_chunks(documents):
    """Split documents into chunks."""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=7500, chunk_overlap=100)
    return text_splitter.split_documents(documents)

def setup_vector_db(chunks):
    """Initialize and populate vector database."""
    return Chroma.from_documents(
        documents=chunks,
        embedding=OllamaEmbeddings(model="nomic-embed-text", show_progress=True),
        collection_name="local-rag"
    )

def setup_retriever(vector_db, llm):
    """Configure the retriever with query prompt."""
    query_prompt = PromptTemplate(
        input_variables=["question"],
        template="""You are an AI assistant helping users. Your task is to understand the question properly and provide a structured response.
        
        Original question: {question}"""
    )
    
    return MultiQueryRetriever.from_llm(
        retriever=vector_db.as_retriever(search_kwargs={"k": 100}),
        llm=llm,
        prompt=query_prompt
    )

def setup_rag_chain(retriever, llm):
    """Set up the RAG pipeline."""
    template = """Answer the question based on ALL the following context. Make sure to consider all relevant information from the provided context:
    {context}

    Question: {question}

    Important: Consider ALL relevant information from the context when providing your answer. If there are multiple relevant items, mention them all.
    """
    
    prompt = ChatPromptTemplate.from_template(template)
    
    return (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

def chat_loop(chain):
    """Run the interactive chat loop."""
    while True:
        user_query = input("\nAsk about shoes under $10 (or type 'exit' to quit): ")
        if user_query.lower() == "exit":
            break
        response = chain.invoke(user_query)
        print("\nAI Response:\n", response)

def main():
    """Main function to orchestrate the RAG pipeline."""
    # Initialize and scrape data
    config = initialize_environment()
    result = scrape_data(config)
    
    # Save and load data
    save_to_excel(result)
    latest_file = load_latest_excel()
    df = pd.read_excel(latest_file, engine='openpyxl')
    print(f"Loaded file: {latest_file}")
    
    # Process documents
    documents = convert_to_documents(df)
    chunks = create_text_chunks(documents)
    vector_db = setup_vector_db(chunks)
    
    # Setup LLM and chain
    llm = ChatOllama(model="mistral")
    retriever = setup_retriever(vector_db, llm)
    chain = setup_rag_chain(retriever, llm)
    
    # Start chat interface
    chat_loop(chain)

if __name__ == "__main__":
    main()