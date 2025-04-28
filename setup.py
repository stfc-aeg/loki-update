from setuptools import setup, find_packages

setup(
    name="loki_update",
    version="0.1.0",
    author="Callum Lee",
    author_email="callum.lee@stfc.ac.uk",
    description="An adapter to manage image versions and updates on LOKI systems.",
    url="https://github.com/stfc-aeg/loki-update",
    packages=find_packages(),
    install_requires=[
        "odin_control @ git+https://git@github.com/odin-detector/odin-control.git@1.6.0",
        "tornado>=4.3",
        "future",
        "pyfdt"    
    ],
    python_requires=">=3.7",
)