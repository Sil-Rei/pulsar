from django.apps import AppConfig
import os


class BaseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'base'

    def ready(self):
        from .HistoricalGatherer import HistoricalGatherer
        from .symboladder import symboladder
        if os.environ.get('RUN_MAIN'):
            #gatherer = HistoricalGatherer()
            #adder = symboladder()
            pass
        
            
        
        
     
