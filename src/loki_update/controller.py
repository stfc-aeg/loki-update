import time
import subprocess
import ast
from datetime import datetime

from odin.adapters.parameter_tree import ParameterTree, ParameterTreeError

from loki_update._version import __version__


class LokiUpdateError(Exception):
    """
    Simple execption class to wrap lower-level exceptions
    """
    
    pass

class LokiUpdateController():
    def __init__(self):
        
        # Store initialisation time
        self.init_time = time.time()
        
        self.installed_images_tree = ParameterTree({
            "emmc": (self.get_emmc_installed_image, None),
            "sd": (self.get_sd_installed_image, None),
            "backup": (self.get_backup_installed_image, None),
            "flash": (self.get_flash_installed_image, None)
        })
        
        self.param_tree = ParameterTree({
            "loki_update_version": __version__,
            "server_uptime": (self.get_server_uptime, None),
            "installed_images": self.installed_images_tree
        })
        
    
    def get_server_uptime(self):
        """Get the uptime for the ODIN server.

        This method returns the current uptime for the ODIN server.
        """
        return time.time() - self.init_time
        
    def get(self, path):
        """Get the parameter tree.

        This method returns the parameter tree for use by clients via the LokiUpdate adapter.

        :param path: path to retrieve from tree
        """
        return self.param_tree.get(path)

    def set(self, path, data):
        """Set parameters in the parameter tree.

        This method simply wraps underlying ParameterTree method so that an exceptions can be
        re-raised with an appropriate LokiUpdateError.

        :param path: path of parameter tree to set values for
        :param data: dictionary of new data values to set in the parameter tree
        """
        try:
            self.param_tree.set(path, data)
        except ParameterTreeError as e:
            raise LokiUpdateError(e)
    
    def get_emmc_installed_image(self):
        output = subprocess.run(["loki-update.sh", "--info", "alljson", "--target", "emmc"], capture_output=True, text=True)
        
        error_occurerd, error_message = self.get_error_info(output)
        emmc_image = {}
        
        if not error_occurerd:
            emmc_image = ast.literal_eval(output.stdout.strip())
        
        return {
            "app_name": emmc_image.get("app-name", None),
            "app_version": emmc_image.get("app-version", None),
            "loki_version": emmc_image.get("loki-version", None),
            "platform": emmc_image.get("platform", None),
            "error_occurerd": error_occurerd,
            "error_message": error_message
        }

    def get_sd_installed_image(self):        
        output = subprocess.run(["loki-update.sh", "--info", "alljson", "--target", "sd"], capture_output=True, text=True)
        
        error_occurerd, error_message = self.get_error_info(output)
        sd_image = {}
        
        if not error_occurerd:
            sd_image = ast.literal_eval(output.stdout.strip())
        
        return {
            "app_name": sd_image.get("app-name", None),
            "app_version": sd_image.get("app-version", None),
            "loki_version": sd_image.get("loki-version", None),
            "platform": sd_image.get("platform", None),
            "error_occurerd": error_occurerd,
            "error_message": error_message
        }
    
    def get_backup_installed_image(self):     
        output = subprocess.run(["loki-update.sh", "--info", "alljson", "--target", "backup"], capture_output=True, text=True)
        
        error_occurerd, error_message = self.get_error_info(output)
        backup_image = {}
        
        if not error_occurerd:
            backup_image = ast.literal_eval(output.stdout.strip())
        
        return {
            "app_name": backup_image.get("app-name", None),
            "app_version": backup_image.get("app-version", None),
            "loki_version": backup_image.get("loki-version", None),
            "platform": backup_image.get("platform", None),
            "error_occurerd": error_occurerd,
            "error_message": error_message
        }
    
    def get_flash_installed_image(self):
        output = subprocess.run(["sudo", "loki-update.sh", "--target", "flash", "--info", "alljson"], capture_output=True, text=True)
        
        error_occurerd, error_message = self.get_error_info(output)
        flash_image = {}
        
        if not error_occurerd:
            flash_image = ast.literal_eval(output.stdout.strip())
        
        return {
            "app_name": flash_image.get("app-name", None),
            "app_version": flash_image.get("app-version", None),
            "loki_version": flash_image.get("loki-version", None),
            "platform": flash_image.get("platform", None),
            "error_occurerd": error_occurerd,
            "error_message": error_message
        }
        
    def get_error_info(self, output):
        error_occurerd = False
        error_message = None
        
        if output.returncode != 0:
            error_occurerd = True
            error_message = output.stderr.strip()
        
        return error_occurerd, error_message