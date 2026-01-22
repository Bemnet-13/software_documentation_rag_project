try:
    from langchain_tavily import TavilySearchResults
    print("SUCCESS: langchain_tavily imported")
except ImportError as e:
    print(f"FAILED langchain_tavily: {e}")
    try:
        # Fallback to the one that worked before but warned
        from langchain_community.tools.tavily_search import TavilySearchResults
        print("SUCCESS: langchain_community.tools.tavily_search imported")
    except ImportError as e2:
        print(f"FAILED langchain_community: {e2}")
