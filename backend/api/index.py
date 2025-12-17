# Vercel Serverless Function Entry Point
from server import app

# This is required for Vercel to recognize the FastAPI app
handler = app