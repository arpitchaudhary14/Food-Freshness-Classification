# Backend Dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt
COPY ./backend /app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
