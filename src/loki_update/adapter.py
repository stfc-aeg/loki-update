import logging

from tornado.escape import json_decode

from odin.adapters.adapter import ApiAdapter, ApiAdapterResponse, request_types, response_types
from odin.adapters.parameter_tree import ParameterTreeError

from loki_update.controller import LokiUpdateController, LokiUpdateError


class LokiUpdateAdapter(ApiAdapter):
    def __init__(self, **kwargs):
        """Initialise the LokiUpdateAdapter object.

        This constructor initialises the LokiUpdateAdapter object.

        :param kwargs: keyword arguments specifying options
        """
        super(LokiUpdateAdapter, self).__init__(**kwargs)
        
        # Parse options
        emmc_base_path = str(self.options.get("emmc_base_path"))
        sd_base_path = str(self.options.get("sd_base_path"))
        backup_base_path = str(self.options.get("backup_base_path"))
        
        self.controller = LokiUpdateController(emmc_base_path, sd_base_path, backup_base_path)
        
        logging.debug("LokiUpdateAdapter loaded")
        
    @response_types('application/json', default='application/json')
    def get(self, path, request):
        """Handle an HTTP GET request.

        This method handles an HTTP GET request, returning a JSON response.

        :param path: URI path of request
        :param request: HTTP request object
        :return: an ApiAdapterResponse object containing the appropriate response
        """
        try:
            response = self.controller.get(path)
            status_code = 200
        except ParameterTreeError as e:
            response = {'error': str(e)}
            status_code = 400

        content_type = 'application/json'

        return ApiAdapterResponse(response, content_type=content_type,
                                  status_code=status_code)

    @request_types('application/json')
    @response_types('application/json', default='application/json')
    def put(self, path, request):
        """Handle an HTTP PUT request.

        This method handles an HTTP PUT request, returning a JSON response.

        :param path: URI path of request
        :param request: HTTP request object
        :return: an ApiAdapterResponse object containing the appropriate response
        """

        content_type = 'application/json'

        try:
            data = json_decode(request.body)
            self.controller.set(path, data)
            response = self.controller.get(path)
            status_code = 200
        except LokiUpdateError as e:
            response = {'error': str(e)}
            status_code = 400
        except (TypeError, ValueError) as e:
            response = {'error': 'Failed to decode PUT request body: {}'.format(str(e))}
            status_code = 400

        logging.debug(response)

        return ApiAdapterResponse(response, content_type=content_type,
                                  status_code=status_code)
        
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

    def delete(self, path, request):
        """Handle an HTTP DELETE request.

        This method handles an HTTP DELETE request, returning a JSON response.

        :param path: URI path of request
        :param request: HTTP request object
        :return: an ApiAdapterResponse object containing the appropriate response
        """
        response = 'LokiUpdateAdapter: DELETE on path {}'.format(path)
        status_code = 200

        logging.debug(response)

        return ApiAdapterResponse(response, status_code=status_code)
    
    def cleanup(self):
        """Clean up adapter state at shutdown.

        This method cleans up the adapter state when called by the server at e.g. shutdown.
        It simplied calls the cleanup function of the controller instance.
        """
        self.controller.cleanup()