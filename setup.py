from setuptools import find_packages, setup

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="smf-lead-capture",
    version="1.0.0",
    author="SMF Works",
    author_email="michael@smfworks.com",
    description="Production lead capture and qualification system for small businesses",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/mikesmoltbot-hub/smf-lead-capture",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.9",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "smf-lead-capture=smf_lead_capture.cli:main",
        ],
    },
    include_package_data=True,
    package_data={
        "smf_lead_capture": ["../assets/*"],
    },
)