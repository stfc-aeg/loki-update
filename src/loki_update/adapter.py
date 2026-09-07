from odin_control.adapters.adapter import (
    ApiAdapter,
)

from loki_update.controller import LokiUpdateController, LokiUpdateError


class LokiUpdateAdapter(ApiAdapter):
    version = "0.1"
    controller_cls = LokiUpdateController
    error_cls = LokiUpdateError
