import os
import json
import google.generativeai as genai

def lambda_handler(event, context):
    try:
        # Set Gemini API key
        genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
        
        # Parse request body
        body = json.loads(event['body'])
        transcription_text = body.get('transcriptionText', '')
        summary_level = body.get('summaryLevel', '')
        

        if not transcription_text:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': 'Transcription text is required.'})
            }
            
        if not summary_level:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': 'Transcription text is required.'})
            }

        
        level_dict = {
            "Kindergarten (Ages 4-5)": (
                "Summarize the following text for a child in kindergarten, aged 4 to 5 years old. "
                "Use very simple words and short, clear sentences. "
                "Focus on basic concepts and ideas, and avoid any complex vocabulary or abstract concepts. "
                "Make the summary engaging and relatable by using examples familiar to a child of this age."
            ),
            "Preparatory (Ages 5-6)": (
                "Summarize the following text for a preparatory student, aged 5 to 6 years old. "
                "Use simple language and short sentences. "
                "Introduce basic ideas and concepts in an accessible way. "
                "Avoid complex terms, and if necessary, explain them using words a child can understand."
            ),
            "Year 1 (Ages 6-7)": (
                "Summarize the following text for a Year 1 student, aged 6 to 7 years old. "
                "Use simple vocabulary and straightforward sentences. "
                "Present the main ideas clearly, and relate them to everyday experiences a child might have."
            ),
            "Year 2 (Ages 7-8)": (
                "Summarize the following text for a Year 2 student, aged 7 to 8 years old. "
                "Use clear and simple language. "
                "Introduce slightly more complex ideas than for Year 1, but ensure explanations are easy to follow. "
                "Use examples and analogies that are appropriate for this age group."
            ),
            "Year 3 (Ages 8-9)": (
                "Summarize the following text for a Year 3 student, aged 8 to 9 years old. "
                "Use age-appropriate vocabulary and sentence structures. "
                "Explain concepts in a clear and engaging manner, incorporating examples that resonate with students of this age."
            ),
            "Year 4 (Ages 9-10)": (
                "Summarize the following text for a Year 4 student, aged 9 to 10 years old. "
                "Use clear language with slightly more advanced vocabulary. "
                "Present ideas logically, and introduce basic explanations of any new terms or concepts."
            ),
            "Year 5 (Ages 10-11)": (
                "Summarize the following text for a Year 5 student, aged 10 to 11 years old. "
                "Use language appropriate for upper primary students, including moderately complex sentences and vocabulary. "
                "Explain new concepts thoroughly, and relate them to knowledge the student may already have."
            ),
            "Year 6 (Ages 11-12)": (
                "Summarize the following text for a Year 6 student, aged 11 to 12 years old. "
                "Use clear and descriptive language appropriate for students preparing to enter secondary school. "
                "Introduce and explain new ideas and vocabulary, ensuring the summary is informative and engaging."
            ),
            "Year 7 (Ages 12-13)": (
                "Summarize the following text for a Year 7 student, aged 12 to 13 years old. "
                "Use language suitable for early secondary students, including more complex sentences and vocabulary. "
                "Explain concepts in detail, and introduce critical thinking elements where appropriate."
            ),
            "Year 8 (Ages 13-14)": (
                "Summarize the following text for a Year 8 student, aged 13 to 14 years old. "
                "Use language that is engaging and suitable for middle secondary students. "
                "Present ideas clearly, and encourage understanding of more abstract concepts with appropriate explanations."
            ),
            "Year 9 (Ages 14-15)": (
                "Summarize the following text for a Year 9 student, aged 14 to 15 years old. "
                "Use language appropriate for teenagers, incorporating more sophisticated vocabulary and sentence structures. "
                "Explain complex ideas thoroughly, and relate them to real-world contexts where possible."
            ),
            "Year 10 (Ages 15-16)": (
                "Summarize the following text for a Year 10 student, aged 15 to 16 years old. "
                "Use clear and precise language suitable for students approaching senior secondary levels. "
                "Include explanations of advanced concepts, and encourage critical engagement with the material."
            ),
            "Year 11 (Ages 16-17)": (
                "Summarize the following text for a Year 11 student, aged 16 to 17 years old. "
                "Use sophisticated language and include detailed explanations of key concepts. "
                "Assume foundational knowledge of the subject area, and introduce advanced ideas where appropriate."
            ),
            "Year 12 (Ages 17-18)": (
                "Summarize the following text for a Year 12 student, aged 17 to 18 years old. "
                "Use advanced language suitable for final-year secondary students preparing for tertiary education. "
                "Include comprehensive explanations of complex concepts, and encourage analytical thinking."
            ),
            "University Undergraduate in Field": (
                "Summarize the following text for a university undergraduate student majoring in this subject. "
                "Use appropriate technical terminology and assume foundational knowledge in the field. "
                "Focus on the key findings, methodologies, and implications relevant to the subject area."
            ),
            "University Undergraduate in Adjacent Field": (
                "Summarize the following text for a university undergraduate student in a related field. "
                "Use technical language but provide clear explanations of specialized terms unique to this subject. "
                "Highlight the main ideas and how they connect to concepts the student may be familiar with."
            ),
            "University Undergraduate in Unrelated Field": (
                "Summarize the following text for a university undergraduate student in an unrelated field. "
                "Use general academic language and explain all specialized terminology. "
                "Focus on conveying the core concepts and significance without assuming prior knowledge."
            ),
            "University Postgraduate in Field": (
                "Summarize the following text for a university postgraduate student specializing in this subject. "
                "Use advanced technical language and assume in-depth knowledge of the field. "
                "Emphasize nuanced details, methodologies, and the broader context within the field's research landscape."
            ),
            "University Postgraduate in Adjacent Field": (
                "Summarize the following text for a university postgraduate student in a related field. "
                "Use technical language appropriate for postgraduate studies, but explain specialized concepts unique to this subject. "
                "Draw connections between the content and the student's area of expertise."
            ),
            "University Postgraduate in Unrelated Field": (
                "Summarize the following text for a university postgraduate student in an unrelated field. "
                "Simplify complex concepts and avoid excessive technical jargon. "
                "Provide thorough explanations to ensure understanding without assuming prior knowledge of the subject."
            ),
            "General Public": (
                "Summarize the following text for a general audience without specialized knowledge. "
                "Use clear, accessible language and avoid technical jargon unless it is well-explained. "
                "Focus on the main ideas and their relevance to everyday life."
            ),
            "Industry Professional in Related Field": (
                "Summarize the following text for industry professionals working in a related field. "
                "Use industry-specific terminology and assume practical experience with similar concepts. "
                "Highlight practical applications, implications, and how it relates to current industry practices."
            ),
            "Industry Professional in Unrelated Field": (
                "Summarize the following text for professionals working in an unrelated industry. "
                "Use clear language and explain any specialized concepts or terminology. "
                "Emphasize the key ideas and their potential relevance or interest to professionals outside the field."
            ),
            "ESL Learners": (
                "Summarize the following text for readers whose first language is not English. "
                "Use simple, clear sentences and avoid idiomatic expressions or culturally specific references. "
                "Ensure that explanations are thorough to aid comprehension."
            ),
            "Individuals with Learning Challenges": (
                "Summarize the following text in a clear and concise manner for individuals with learning difficulties. "
                "Use straightforward language, short sentences, and organize information logically. "
                "Avoid overwhelming the reader with too much information at once, and highlight the most important points."
            ),
        }


        if summary_level not in level_dict:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': f'Invalid summary level: {summary_level}.'})
            }



        # Call the Gemini model
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=f"You are an assistant specialized in summarizing text. Always provide a concise summary of the input text. Do not respond conversationally. You must summarise the text to the level of a {level_dict[summary_level]}."
        )
        
        response = model.generate_content(f"Summarise the following text: \n\n{transcription_text}")

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'summary': response.text})
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': str(e)})
        }
