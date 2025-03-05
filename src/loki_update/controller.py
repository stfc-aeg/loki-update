import time
import subprocess
import ast

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
        
        self.refresh_all_image_info = False
        self.refresh_emmc_image_info = False
        self.refresh_sd_image_info = False
        self.refresh_backup_image_info = False
        self.refresh_flash_image_info = False
        self.refresh_runtime_image_info = False
        
        # Store inital image info
        self.emmc_installed_image = self.get_emmc_installed_image()
        self.sd_installed_image = self.get_sd_installed_image()
        self.backup_installed_image = self.get_backup_installed_image()
        self.flash_installed_image = self.get_flash_installed_image()
        self.runtime_installed_image = self.get_runtime_installed_image()
        
        self.installed_images_tree = ParameterTree({
            "emmc": {
                "info": (lambda: self.emmc_installed_image, None),
                "refresh": (self.get_refresh_emmc_image_info, self.set_refresh_emmc_image_info)
                },
            "sd": {
                "info": (lambda: self.sd_installed_image, None),
                "refresh": (self.get_refresh_sd_image_info, self.set_refresh_sd_image_info)
                },
            "backup": {
                "info": (lambda: self.backup_installed_image, None),
                "refresh": (self.get_refresh_backup_image_info, self.set_refresh_backup_image_info)
                },
            "flash": {
                "info": (lambda: self.flash_installed_image, None),
                "refresh": (self.get_refresh_flash_image_info, self.set_refresh_flash_image_info)
                },
            "runtime": {
                "info": (lambda: self.runtime_installed_image, None),
                "refresh": (self.get_refresh_runtime_image_info, self.set_refresh_runtime_image_info)
                },
            "refresh_all_image_info": (self.get_refresh_all_image_info, self.set_refresh_all_image_info)
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
            "time": emmc_image.get("time", None),
            "error_occurerd": error_occurerd,
            "error_message": error_message,
            
        }

    def get_sd_installed_image(self):        
        output = subprocess.run(["loki-update.sh", "--target", "sd", "--info", "alljson"], capture_output=True, text=True)
        
        error_occurerd, error_message = self.get_error_info(output)
        sd_image = {}
        
        if not error_occurerd:
            sd_image = ast.literal_eval(output.stdout.strip())
        
        return {
            "app_name": sd_image.get("app-name", None),
            "app_version": sd_image.get("app-version", None),
            "loki_version": sd_image.get("loki-version", None),
            "platform": sd_image.get("platform", None),
            "time": sd_image.get("time", None),
            "error_occurerd": error_occurerd,
            "error_message": error_message
        }
    
    def get_backup_installed_image(self):     
        output = subprocess.run(["loki-update.sh", "--target", "backup", "--info", "alljson"], capture_output=True, text=True)
        
        error_occurerd, error_message = self.get_error_info(output)
        backup_image = {}
        
        if not error_occurerd:
            backup_image = ast.literal_eval(output.stdout.strip())
        
        return {
            "app_name": backup_image.get("app-name", None),
            "app_version": backup_image.get("app-version", None),
            "loki_version": backup_image.get("loki-version", None),
            "platform": backup_image.get("platform", None),
            "time": backup_image.get("time", None),
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
            "time": flash_image.get("time", None),
            "error_occurerd": error_occurerd,
            "error_message": error_message
        }
        
    def get_runtime_installed_image(self):
        output = subprocess.run(["loki-update.sh", "--target", "runtime", "--info", "alljson"], capture_output=True, text=True)
        
        error_occurerd, error_message = self.get_error_info(output)
        runtime_image = {}
        
        if not error_occurerd:
            runtime_image = ast.literal_eval(output.stdout.strip())
        
        return {
            "app_name": runtime_image.get("app-name", None),
            "app_version": runtime_image.get("app-version", None),
            "loki_version": runtime_image.get("loki-version", None),
            "platform": runtime_image.get("platform", None),
            "time": runtime_image.get("time", None),
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
    
    def get_refresh_all_image_info(self):
        return self.refresh_all_image_info
    
    def set_refresh_all_image_info(self, refresh):
        self.refresh_all_image_info = bool(refresh)
        
        if self.refresh_all_image_info:
            self.emmc_installed_image = self.get_emmc_installed_image()
            self.sd_installed_image = self.get_sd_installed_image()
            self.backup_installed_image = self.get_backup_installed_image()
            self.flash_installed_image = self.get_flash_installed_image()
            self.runtime_installed_image = self.get_runtime_installed_image()
            self.refresh_image_all_info = False
            
    def get_refresh_emmc_image_info(self):
        return self.refresh_emmc_image_info
    
    def set_refresh_emmc_image_info(self, refresh):
        self.refresh_emmc_image_info = bool(refresh)
        
        if self.refresh_emmc_image_info:
            self.emmc_installed_image = self.get_emmc_installed_image()
            self.refresh_emmc_image_info = False
    
    def get_refresh_sd_image_info(self):
        return self.refresh_sd_image_info
    
    def set_refresh_sd_image_info(self, refresh):
        self.refresh_sd_image_info = bool(refresh)
        
        if self.refresh_sd_image_info:
            self.sd_installed_image = self.get_sd_installed_image()
            self.refresh_sd_image_info = False
            
    def get_refresh_backup_image_info(self):
        return self.refresh_backup_image_info
    
    def set_refresh_backup_image_info(self, refresh):
        self.refresh_backup_image_info = bool(refresh)
        
        if self.refresh_backup_image_info:
            self.backup_installed_image = self.get_backup_installed_image()
            self.refresh_backup_image_info = False
            
    def get_refresh_flash_image_info(self):
        return self.refresh_flash_image_info
    
    def set_refresh_flash_image_info(self, refresh):
        self.refresh_flash_image_info = bool(refresh)
        
        if self.refresh_flash_image_info:
            self.flash_installed_image = self.get_flash_installed_image()
            self.refresh_flash_image_info = False
            
    def get_refresh_runtime_image_info(self):
        return self.refresh_runtime_image_info
    
    def set_refresh_runtime_image_info(self, refresh):
        self.refresh_runtime_image_info = bool(refresh)
        
        if self.refresh_runtime_image_info:
            self.runtime_installed_image = self.get_runtime_installed_image()
            self.refresh_runtime_image_info = False