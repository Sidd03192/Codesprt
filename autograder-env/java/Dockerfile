# Start with an official image that already has Java and Maven.
FROM maven:3.8.5-openjdk-17

# Set up a workspace inside the container.
WORKDIR /autograder

# Copy our two custom helper scripts into the container.
COPY run.sh .
COPY translate_results.py .

# Make our main script executable.
RUN chmod +x run.sh
