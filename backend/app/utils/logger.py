from logging import (
    getLogger,
    StreamHandler,
    FileHandler,
    DEBUG,
    Formatter,
)
from typing import Any
import os

class Logger:
    def __call__(self, name, file_name='file.log') -> Any:
        logger = getLogger(name)

        if logger.hasHandlers():
            return logger
        
        logger.setLevel(DEBUG)
        handler_stream = StreamHandler()
        handler_file = FileHandler(os.path.abspath(file_name))
        handler_stream.setLevel(DEBUG)
        handler_file.setLevel(DEBUG)

        format_stream = Formatter('%(name)s - %(levelname)s - %(message)s')
        handler_stream.setFormatter(format_stream)

        format_file = Formatter('%(asctime)s %(name)s - %(levelname)s - %(message)s')
        handler_file.setFormatter(format_file)

        logger.addHandler(handler_stream)
        logger.addHandler(handler_file)

        return logger
    
get_logger = Logger()