import json
import os
from typing import List, Dict, Union

SOURCES_FILE = "sources_metadata.json"

class SourceManager:
    def __init__(self):
        self.sources = self._load_sources()

    def _load_sources(self) -> List[Dict]:
        if not os.path.exists(SOURCES_FILE):
            return []
        try:
            with open(SOURCES_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return []

    def _save_sources(self):
        with open(SOURCES_FILE, "w") as f:
            json.dump(self.sources, f, indent=2)

    def get_sources(self) -> List[Dict]:
        return self.sources

    def add_source(self, type: str, title: str, source: str, url: str = None):
        new_source = {
            "id": len(self.sources) + 1, # Simple ID generation
            "type": type,
            "title": title,
            "source": source,
            "url": url
        }
        self.sources.append(new_source)
        self._save_sources()
        return new_source

    def delete_source(self, source_id: int):
        self.sources = [s for s in self.sources if s["id"] != source_id]
        self._save_sources()

source_manager = SourceManager()
