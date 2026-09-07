from setuptools import setup, find_packages

setup(
    name="loki_update",
    version="0.1.0",
    author="Callum Lee",
    author_email="callum.lee@stfc.ac.uk",
    description="An adapter to manage image versions and updates on LOKI systems.",
    url="https://github.com/stfc-aeg/loki-update",
    packages=find_packages("src"),
    package_dir={"": "src"},
    install_requires=[
        "odin_control>=2.0.0",
        "tornado>=4.3",
        "future",
        "pyfdt",
        "requests",
    ],
    python_requires=">=3.7",
)
