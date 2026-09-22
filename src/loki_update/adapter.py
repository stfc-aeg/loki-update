from odin_control.adapters.adapter import (
    ApiAdapter,
    ApiAdapterResponse,
)

from loki_update.controller import LokiUpdateController, LokiUpdateError
import logging


class LokiUpdateAdapter(ApiAdapter):
    version = "0.1"
    controller_cls = LokiUpdateController
    error_cls = LokiUpdateError

    def post(self, path, request):
        """Handle an HTTP POST request.

        This method handles an HTTP POST request, returning a JSON response.

        :return: ApiAdapterResponse object containing the appropriate response
        """
        
        content_type = "application/json"
        
        try:
            self.controller.upload_file(request.files["file"])
            
            response = {"ok": "Files uploaded"}
            status_code = 200
        except LokiUpdateError as e:
            response = {'error': str(e)}
            status_code = 400
        except (TypeError, ValueError) as e:
            response = {'error': 'Failed to decode POST request body: {}'.format(str(e))}
            status_code = 400

        logging.debug(response)
        
        return ApiAdapterResponse(response, content_type=content_type, status_code=status_code)
