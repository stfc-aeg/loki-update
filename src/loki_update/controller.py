import time
import subprocess
import os
import shutil
import logging
from pyfdt.pyfdt import *

from odin.adapters.parameter_tree import ParameterTree, ParameterTreeError

from loki_update._version import __version__


class LokiUpdateError(Exception):
    """
    Simple execption class to wrap lower-level exceptions
    """
    
    pass

class LokiUpdateController():
    def __init__(self):
        
        self.emmc_dtb_path = "/tmp/emmc.dtb"
        self.sd_dtb_path = "/tmp/sd.dtb"
        self.backup_dtb_path = "/tmp/backup.dtb"
        
        self.emmc_u_boot_path = "/mnt/emmc/image.ub"
        self.sd_u_boot_path = "/mnt/sd/image.ub"
        self.backup_u_boot_path = "/mnt/emmc/backup/image.ub"
        
        # Store initialisation time
        self.init_time = time.time()
        
        self.refresh_all_image_info = False
        self.refresh_emmc_image_info = False
        self.refresh_sd_image_info = False
        self.refresh_backup_image_info = False
        self.refresh_flash_image_info = False
        self.refresh_runtime_image_info = False
        
        # Store inital image info
        self.emmc_installed_image = self.get_installed_image("emmc")
        self.sd_installed_image = self.get_installed_image("sd")
        self.backup_installed_image = self.get_installed_image("backup")
        self.flash_installed_image = self.get_installed_image("flash")
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
            self.emmc_installed_image = self.get_installed_image("emmc")
            self.sd_installed_image = self.get_installed_image("sd")
            self.backup_installed_image = self.get_installed_image("backup")
            self.flash_installed_image = self.get_installed_image("flash")
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
            self.flash_installed_image = self.get_installed_image("flash")
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
        try:
            name = ""
            app_version = ""
            loki_version = ""
            platform = ""
            timestamp = ""
            error_occured = False
            error_message = ""
            
            if device in ["emmc", "sd", "backup"]:
                
                match device:
                    case "emmc":
                        u_boot_path = self.emmc_u_boot_path
                        dtb_path = self.emmc_dtb_path
                    case "sd":
                        u_boot_path = self.sd_u_boot_path
                        dtb_path = self.sd_dtb_path
                    case "backup":
                        u_boot_path = self.backup_u_boot_path
                        dtb_path = self.backup_dtb_path            
                
                self.check_for_error(subprocess.run(["dumpimage", "-T", "flat_dt", "-p", "1", u_boot_path, "-o", dtb_path], capture_output=True, text=True))
                
                with open(dtb_path, "rb") as fdt_file:
                    fdt = FdtBlobParse(fdt_file)
                
            elif device == "flash":
                temp_dir_output = subprocess.run(["mktemp", "-d"], capture_output=True, text=True)
                self.check_for_error(temp_dir_output)
                temp_dir = temp_dir_output.stdout.strip()
                
                device_list_output = subprocess.run(["sudo", "lsmtd", "-r"], capture_output=True, text=True)
                self.check_for_error(device_list_output)
                device_list = device_list_output.stdout.splitlines()
                
                for line in device_list:
                    if "kernel" in line:
                        label = line.split()[0]
                        break
                
                kernel_mtddev = "/dev/" + label
                
                u_boot_path = temp_dir + "/image.ub"
                dtb_path = temp_dir + "/system.dtb"
                
                with open(kernel_mtddev, "rb") as kernel_mtddev_file:
                    kernel_mtddev_contents = kernel_mtddev_file.read()
                    kernel_mtddev_file.close()
                
                with open(u_boot_path, "wb") as u_boot_file:
                    u_boot_file.write(kernel_mtddev_contents)
                    u_boot_file.close()
                    
                self.check_for_error(subprocess.run(["dumpimage", "-T", "flat_dt", "-p", "1", u_boot_path, "-o", dtb_path], capture_output=True, text=True))
                
                with open(dtb_path, "rb") as fdt_file:
                    fdt = FdtBlobParse(fdt_file)
                
                shutil.rmtree(temp_dir)

            json_fdt =  json.loads(fdt.to_fdt().to_json())

            name = json_fdt["loki-metadata"]["application-name"][1]
            app_version = json_fdt["loki-metadata"]["application-version"][1]
            loki_version = json_fdt["loki-metadata"]["loki-version"][1]
            platform = json_fdt["loki-metadata"]["platform"][1]
            
            timestamp_output = subprocess.run(["fdtget", "-t", "i", u_boot_path, "/", "timestamp"], capture_output=True, text=True)
            self.check_for_error(timestamp_output)
            timestamp = timestamp_output.stdout.strip()
            
        except Exception as error:  
            error_occured = True
            error_message = str(error)
            logging.error(str(error))
            
            if device == "flash":
                shutil.rmtree(temp_dir)
            
        finally:
            return name, app_version, loki_version, platform, timestamp, error_occured, error_message
    
    def get_runtime_image_metadata(self):
        try:
            name = ""
            app_version = ""
            loki_version = ""
            platform = ""
            timestamp = ""
            error_occured = False
            error_message = ""
            
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
                
        except Exception as error:
            error_occured = True
            error_message = str(error)
            
        finally:
            return name, app_version, loki_version, platform, timestamp, error_occured, error_message

    def check_for_error(self, process):
        if process.returncode != 0:
            raise Exception(process.stderr.strip())