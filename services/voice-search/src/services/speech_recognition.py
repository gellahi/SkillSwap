import os
import logging
import tempfile
from typing import BinaryIO, Optional
import speech_recognition as sr
from pydub import AudioSegment

from src.core.config import settings
from src.core.exceptions import BadRequestException, ServiceUnavailableException

logger = logging.getLogger(__name__)

class SpeechRecognitionService:
    """Service for speech recognition."""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.language = settings.SPEECH_RECOGNITION_LANGUAGE
        self.max_size_bytes = settings.MAX_AUDIO_SIZE_MB * 1024 * 1024  # Convert MB to bytes
        self.sample_rate = settings.AUDIO_SAMPLE_RATE
    
    def recognize_from_file(self, audio_file: BinaryIO, file_extension: str) -> str:
        """
        Recognize speech from an audio file.
        
        Args:
            audio_file: Audio file object
            file_extension: File extension (e.g., 'wav', 'mp3')
            
        Returns:
            Recognized text
        """
        try:
            # Check file size
            audio_file.seek(0, os.SEEK_END)
            file_size = audio_file.tell()
            audio_file.seek(0)
            
            if file_size > self.max_size_bytes:
                raise BadRequestException(
                    message=f"Audio file size exceeds the maximum allowed size of {settings.MAX_AUDIO_SIZE_MB}MB"
                )
            
            # Create a temporary file
            with tempfile.NamedTemporaryFile(suffix=f".{file_extension}", delete=False) as temp_file:
                temp_file.write(audio_file.read())
                temp_path = temp_file.name
            
            try:
                # Convert audio to WAV format if needed
                if file_extension.lower() != "wav":
                    audio = AudioSegment.from_file(temp_path, format=file_extension.lower())
                    wav_path = temp_path.replace(f".{file_extension}", ".wav")
                    audio.export(wav_path, format="wav")
                    temp_path = wav_path
                
                # Recognize speech
                with sr.AudioFile(temp_path) as source:
                    audio_data = self.recognizer.record(source)
                    text = self.recognizer.recognize_google(audio_data, language=self.language)
                    
                    if not text:
                        raise BadRequestException(message="No speech detected in the audio file")
                    
                    return text
            finally:
                # Clean up temporary files
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                
                wav_path = temp_path.replace(f".{file_extension}", ".wav")
                if os.path.exists(wav_path) and wav_path != temp_path:
                    os.unlink(wav_path)
        
        except sr.UnknownValueError:
            logger.warning("Speech recognition could not understand audio")
            raise BadRequestException(message="Could not understand audio")
        
        except sr.RequestError as e:
            logger.error(f"Speech recognition service error: {e}")
            raise ServiceUnavailableException(message="Speech recognition service is unavailable")
        
        except Exception as e:
            logger.error(f"Speech recognition error: {e}")
            raise BadRequestException(message=f"Speech recognition failed: {str(e)}")
    
    def recognize_from_bytes(self, audio_bytes: bytes, file_format: str) -> str:
        """
        Recognize speech from audio bytes.
        
        Args:
            audio_bytes: Audio data as bytes
            file_format: Audio format (e.g., 'wav', 'mp3')
            
        Returns:
            Recognized text
        """
        # Create a temporary file
        with tempfile.NamedTemporaryFile(suffix=f".{file_format}", delete=False) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name
        
        try:
            # Convert audio to WAV format if needed
            if file_format.lower() != "wav":
                audio = AudioSegment.from_file(temp_path, format=file_format.lower())
                wav_path = temp_path.replace(f".{file_format}", ".wav")
                audio.export(wav_path, format="wav")
                temp_path = wav_path
            
            # Recognize speech
            with sr.AudioFile(temp_path) as source:
                audio_data = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio_data, language=self.language)
                
                if not text:
                    raise BadRequestException(message="No speech detected in the audio")
                
                return text
        
        except sr.UnknownValueError:
            logger.warning("Speech recognition could not understand audio")
            raise BadRequestException(message="Could not understand audio")
        
        except sr.RequestError as e:
            logger.error(f"Speech recognition service error: {e}")
            raise ServiceUnavailableException(message="Speech recognition service is unavailable")
        
        except Exception as e:
            logger.error(f"Speech recognition error: {e}")
            raise BadRequestException(message=f"Speech recognition failed: {str(e)}")
        
        finally:
            # Clean up temporary files
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            
            wav_path = temp_path.replace(f".{file_format}", ".wav")
            if os.path.exists(wav_path) and wav_path != temp_path:
                os.unlink(wav_path)

# Create speech recognition service instance
speech_recognition_service = SpeechRecognitionService()
