import os
import json
import asyncio
import chromadb
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy
from langchain_community.vectorstores import Chroma
from langchain.schema import Document
from langchain_community.embeddings import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv
import asyncio
import nest_asyncio
from crawl4ai import AsyncWebCrawler
# Load OpenAI API Key
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Product schema
class EbayProduct:
    def __init__(self, product_name, price, total_reviews):
        self.product_name = product_name
        self.price = price
        self.total_reviews = total_reviews

async def scrape_data():
    """Scrape eBay products with Crawl4AI + GPT-4o."""
    browser_config = BrowserConfig(verbose=True, headless=True)
    run_config = CrawlerRunConfig(
        word_count_threshold=1,
        extraction_strategy=LLMExtractionStrategy(
            provider="openai/gpt-4o",
            api_token=OPENAI_API_KEY,
            extraction_type="schema",
            instruction="Extract product details as a JSON list with keys: product_name, price, total_reviews."
        ),
        cache_mode=CacheMode.BYPASS,
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(
            url='https://www.ebay.com/sch/i.html?_nkw=shoes+under+10&rt=nc&LH_PrefLoc=6',
            config=run_config
        )

    try:
        extracted_data = json.loads(result.extracted_content)
        if isinstance(extracted_data, list):
            return extracted_data
        raise ValueError("Extracted data is not a list!")
    except json.JSONDecodeError:
        raise ValueError("Failed to parse extracted content into JSON!")

def convert_to_documents(data):
    documents = []
    for item in data:
        content_list = item.get("content", [])  # Get content safely

        # Extract price, assuming price always has a `$` symbol
        price = next((x for x in content_list if "$" in x), "Unknown Price")

        # Extract product name (first non-price, non-generic text)
        product_name = next((x for x in content_list if "$" not in x and "Opens in a new window" not in x), "Unknown Product")

        content = f"Product: {product_name}\nPrice: {price}"
        documents.append(Document(page_content=content))

    return documents

def setup_vector_db(documents):
    """Store scraped products in a vector database."""
    return Chroma.from_documents(
        documents=documents,
        embedding=OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY),
        collection_name="ebay_products"
    )

def setup_rag_chain(vector_db):
    """Set up the retrieval-augmented generation (RAG) pipeline."""
    llm = ChatOpenAI(model="gpt-4o", temperature=0.7, openai_api_key=OPENAI_API_KEY)

    retriever = vector_db.as_retriever(search_kwargs={"k": 10})
    prompt = ChatPromptTemplate.from_template(
        "Context:\n{context}\n\nQuestion: {question}\nAnswer:"
    )

    def retrieve_documents(question):
        docs = retriever.get_relevant_documents(question)
        return "\n".join([doc.page_content for doc in docs]) if docs else "No relevant information found."

    chain = (
        {"context": retrieve_documents, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return chain

def chat_loop(chain):
    """Interactive chatbot for querying eBay products."""
    while True:
        user_query = input("\nAsk about eBay products (or type 'exit' to quit): ")
        if user_query.lower() == "exit":
            break
        response = chain.invoke(user_query)
        print("\nAI Response:\n", response)

async def main():
    """Run scraping, store data, and enable chatbot interaction."""
    extracted_data = await scrape_data()
    print("\nExtracted Data:\n", extracted_data)

    documents = convert_to_documents(extracted_data)
    vector_db = setup_vector_db(documents)
    chain = setup_rag_chain(vector_db)

    chat_loop(chain)

# Run script
if __name__ == "__main__":
    asyncio.run(main())