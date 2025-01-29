# Scraibe - AI Transcription and Summarization Web Application

Scraibe is a cloud-based app for transcribing audio and extracting text from PDFs. It leverages AWS services like **Textract** (OCR), **Transcribe** (speech-to-text), and **Lambda** (serverless processing). It also provides AI-powered summaries customized to the user’s knowledge level.

The **backend is fully functional**, while the **frontend (ReactJS) is under development**.

## Features
- **Audio & PDF Processing**: Transcribes audio and extracts text from PDFs.
- **AI-Powered Summarization**: Generates concise summaries.
- **Scalable Serverless Architecture**: Uses AWS API Gateway, Lambda, and S3.
- **Asynchronous Processing**: Tracks job status for long-running tasks.

## Tech Stack
- **Frontend**: ReactJS *(In Progress)*
- **Backend**: AWS API Gateway, AWS Lambda
- **Storage**: AWS S3
- **AI Services**: AWS Textract, AWS Transcribe, NLP models

## How It Works
1. Users upload an **audio** or **PDF** file.
2. API Gateway routes the request to **Lambda**.
3. Processing based on file type:
   - **Audio** → **Transcribe** converts speech to text.
   - **PDF** → **Textract** extracts text.
4. NLP models summarize the extracted text.
5. Processed results are stored in **S3**.
6. Users receive status updates asynchronously.
