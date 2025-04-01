import time
import subprocess
import os
import logging
from concurrent import futures
import tempfile

from pyfdt.pyfdt import *

from tornado.concurrent import run_on_executor

from odin.adapters.parameter_tree import ParameterTree, ParameterTreeError

from loki_update._version import __version__


class LokiUpdateError(Exception):
    """
    Simple execption class to wrap lower-level exceptions
    """
    
    pass

class LokiUpdateController():

    executor = futures.ThreadPoolExecutor(max_workers=1)

    def __init__(self):
        
        self.emmc_dtb_path = "/tmp/emmc.dtb"
        self.sd_dtb_path = "/tmp/sd.dtb"
        self.backup_dtb_path = "/tmp/backup.dtb"
        
        self.emmc_u_boot_path = "/mnt/sd-mmcblk0p1/image.ub"
        self.sd_u_boot_path = "/mnt/sd-mmcblk1p1/image.ub"
        self.backup_u_boot_path = "/mnt/sd-mmcblk0p1/backup/image.ub"
        
        # Store initialisation time
        self.init_time = time.time()
        
        self.refresh_all_image_info = False
        self.refresh_emmc_image_info = False
        self.refresh_sd_image_info = False
        self.refresh_backup_image_info = False
        self.refresh_flash_image_info = False
        self.refresh_runtime_image_info = False
        
        # Store inital image info
        self.flash_loading = True
        self.flash_app_name = ""
        self.flash_app_version = ""
        self.flash_loki_version = ""
        self.flash_platform = ""
        self.flash_time_created = 0
        self.flash_error_occurred = False
        self.flash_error_message = ""
        self.get_flash_image_metadata_from_dtb()
        self.emmc_installed_image = self.get_installed_image("emmc")
        self.sd_installed_image = self.get_installed_image("sd")
        self.backup_installed_image = self.get_installed_image("backup")
        self.runtime_installed_image = self.get_installed_image("runtime")
        
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
                "info": {
                    "app_name": (lambda: self.flash_app_name, None),
                    "app_version": (lambda: self.flash_app_version, None),
                    "loki_version": (lambda: self.flash_loki_version, None),
                    "platform": (lambda: self.flash_platform, None),
                    "time": (lambda: self.flash_time_created, None),
                    "error_occurred": (lambda: self.flash_error_occurred, None),
                    "error_message": (lambda: self.flash_error_message, None),
                    "last_refresh": time.time()
                },
                "refresh": (self.get_refresh_flash_image_info, self.set_refresh_flash_image_info),
                "loading": (lambda: self.flash_loading, None)
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
    
    def cleanup(self):
        """Clean up the LokiUpdateController instance.
        
        This method removes all temporary files used in this controller.
        """
        os.remove(self.emmc_dtb_path)
        os.remove(self.sd_dtb_path)
        os.remove(self.backup_dtb_path)
    
    def get_installed_image(self, device):
        if device == "runtime":
            name, app_version, loki_version, platform, timestamp, error_occured, error_message = self.get_runtime_image_metadata()
        else:
            name, app_version, loki_version, platform, timestamp, error_occured, error_message = self.get_image_metadata_from_dtb(device)
            
        return {
            "app_name": self.check_empty_info(name),
            "app_version": self.check_empty_info(app_version),
            "loki_version": self.check_empty_info(loki_version),
            "platform": self.check_empty_info(platform),
            "time": timestamp,
            "error_occurred": error_occured,
            "error_message": error_message,
            "last_refresh": time.time()
        }
    
    def get_refresh_all_image_info(self):
        return self.refresh_all_image_info
    
    def set_refresh_all_image_info(self, refresh):
        self.refresh_all_image_info = bool(refresh)
        
        if self.refresh_all_image_info:
            self.get_flash_image_metadata_from_dtb()
            self.emmc_installed_image = self.get_installed_image("emmc")
            self.sd_installed_image = self.get_installed_image("sd")
            self.backup_installed_image = self.get_installed_image("backup")
            self.runtime_installed_image = self.get_installed_image("runtime")
            self.refresh_image_all_info = False
            
    def get_refresh_emmc_image_info(self):
        return self.refresh_emmc_image_info
    
    def set_refresh_emmc_image_info(self, refresh):
        self.refresh_emmc_image_info = bool(refresh)
        
        if self.refresh_emmc_image_info:
            self.emmc_installed_image = self.get_installed_image("emmc")
            self.refresh_emmc_image_info = False
    
    def get_refresh_sd_image_info(self):
        return self.refresh_sd_image_info
    
    def set_refresh_sd_image_info(self, refresh):
        self.refresh_sd_image_info = bool(refresh)
        
        if self.refresh_sd_image_info:
            self.sd_installed_image = self.get_installed_image("sd")
            self.refresh_sd_image_info = False
            
    def get_refresh_backup_image_info(self):
        return self.refresh_backup_image_info
    
    def set_refresh_backup_image_info(self, refresh):
        self.refresh_backup_image_info = bool(refresh)
        
        if self.refresh_backup_image_info:
            self.backup_installed_image = self.get_installed_image("backup")
            self.refresh_backup_image_info = False
            
    def get_refresh_flash_image_info(self):
        return self.refresh_flash_image_info
    
    def set_refresh_flash_image_info(self, refresh):
        self.refresh_flash_image_info = bool(refresh)
        
        if self.refresh_flash_image_info:
            self.get_flash_image_metadata_from_dtb()
            self.refresh_flash_image_info = False
            
    def get_refresh_runtime_image_info(self):
        return self.refresh_runtime_image_info
    
    def set_refresh_runtime_image_info(self, refresh):
        self.refresh_runtime_image_info = bool(refresh)
        
        if self.refresh_runtime_image_info:
            self.runtime_installed_image = self.get_installed_image("runtime")
            self.refresh_runtime_image_info = False
    
    def check_empty_info(self, info):
        if info == "":
            return "Details couldn't be retrieved"
        
        return info
    
    def get_image_metadata_from_dtb(self, device):
        name = ""
        app_version = ""
        loki_version = ""
        platform = ""
        timestamp = ""
        error_occured = False
        error_message = ""
        
        if device == "emmc":
            u_boot_path = self.emmc_u_boot_path
            dtb_path = self.emmc_dtb_path
        elif device == "sd":
            u_boot_path = self.sd_u_boot_path
            dtb_path = self.sd_dtb_path
        elif device == "backup":
            u_boot_path = self.backup_u_boot_path
            dtb_path = self.backup_dtb_path                                    
        
        try:
            subprocess.run(["dumpimage", "-T", "flat_dt", "-p", "1", u_boot_path, "-o", dtb_path], capture_output=True, text=True, check=True)
            
            with open(dtb_path, "rb") as fdt_file:
                fdt = FdtBlobParse(fdt_file)
            
            json_fdt =  json.loads(fdt.to_fdt().to_json())

            name = json_fdt["loki-metadata"]["application-name"][1]
            app_version = json_fdt["loki-metadata"]["application-version"][1]
            loki_version = json_fdt["loki-metadata"]["loki-version"][1]
            platform = json_fdt["loki-metadata"]["platform"][1]

            timestamp_output = subprocess.run(["fdtget", "-t", "i", u_boot_path, "/", "timestamp"], capture_output=True, text=True)
            timestamp = timestamp_output.stdout.strip()
        
        except subprocess.CalledProcessError as error:
            self.flash_error_occured = True
            self.flash_error_message = str(error.stderr)
            logging.error(f"{str(error.cmd)}: {self.flash_error_message}")
        
        except FileNotFoundError as error:
            error_occured = True
            error_message = "Unable to create flattened device tree, .dtb file was not found"
            logging.error(error_message)
        
        except Exception as error:
            error_occured = True
            error_message = str(error)
            logging.error(str(error))

        finally:
            return name, app_version, loki_version, platform, timestamp, error_occured, error_message
    
    @run_on_executor
    def get_flash_image_metadata_from_dtb(self):
        self.flash_loading = True
        with tempfile.TemporaryDirectory() as temp_dir:
            device_list_output = subprocess.run(["lsmtd", "-r"], capture_output=True, text=True, check=True)
            device_list = device_list_output.stdout.splitlines()
            
            for line in device_list:
                if "kernel" in line:
                    label = line.split()[0]
                    break
            
            kernel_mtddev = "/dev/" + label
            
            u_boot_path = temp_dir + "/image.ub"
            dtb_path = temp_dir + "/system.dtb"
            
            try:
                os.system(f"cat {kernel_mtddev} > {u_boot_path}")

                subprocess.run(["dumpimage", "-T", "flat_dt", "-p", "1", u_boot_path, "-o", dtb_path], capture_output=True, text=True, check=True)
            
                with open(dtb_path, "rb") as fdt_file:
                    fdt = FdtBlobParse(fdt_file)
            
                json_fdt = json.loads(fdt.to_fdt().to_json())

                self.flash_app_name = json_fdt["loki-metadata"]["application-name"][1]
                self.flash_app_version = json_fdt["loki-metadata"]["application-version"][1]
                self.flash_loki_version = json_fdt["loki-metadata"]["loki-version"][1]
                self.flash_platform = json_fdt["loki-metadata"]["platform"][1]
                
                timestamp_output = subprocess.run(["fdtget", "-t", "i", u_boot_path, "/", "timestamp"], capture_output=True, text=True, check=True)
                self.flash_time_created = timestamp_output.stdout.strip()
            
            except subprocess.CalledProcessError as error:
                self.flash_error_occured = True
                self.flash_error_message = str(error.stderr)
                logging.error(f"{str(error.cmd)}: {self.flash_error_message}")
            
            except FileNotFoundError as error:
                self.flash_error_occured = True
                self.flash_error_message = "Unable to create flattened device tree, .dtb file was not found"
                logging.error(self.flash_error_message)
            
            except Exception as error:
                self.flash_error_occured = True
                self.flash_error_message = str(error)
                logging.error(str(error))
            
            finally:
                self.flash_loading = False
    
    def get_runtime_image_metadata(self):
        name = ""
        app_version = ""
        loki_version = ""
        platform = ""
        timestamp = ""
        error_occured = False
        error_message = ""
            
        try:
            with open("/sys/firmware/devicetree/base/loki-metadata/application-name", "r") as file:
                name = file.read()
                file.close()
                
            with open("/sys/firmware/devicetree/base/loki-metadata/application-version", "r") as file:
                app_version = file.read()
                file.close()
            
            with open("/sys/firmware/devicetree/base/loki-metadata/loki-version", "r") as file:
                loki_version = file.read()
                file.close()
            
            with open("/sys/firmware/devicetree/base/loki-metadata/platform", "r") as file:
                platform = file.read()
                file.close()
        
        except FileNotFoundError as error:
            error_occured = True
            error_message = "Runtime image details file could not be found"
            logging.error(error_message)
                
        except Exception as error:
            error_occured = True
            error_message = str(error)
            logging.error(error_message)
            
        finally:
            return name, app_version, loki_version, platform, timestamp, error_occured, error_message