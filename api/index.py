import sys
import os

# Add root directory to sys.path so backend import works
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.server import app
