try:
    from langchain_community.tools import DuckDuckGoSearchRun
    print("DuckDuckGoSearchRun imported successfully")
except ImportError as e:
    print(f"ImportError: {e}")

try:
    import duckduckgo_search
    print(f"duckduckgo_search version: {duckduckgo_search.__version__}")
except ImportError as e:
    print(f"duckduckgo_search ImportError: {e}")
