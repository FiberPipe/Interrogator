import serial
import json
import os
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from datetime import datetime

# Define the maximum number of frames for animation
MAX_FRAMES = 200
# Set the serial port parameters
ser = serial.Serial('/dev/cu.usbserial-110', 9600)

# Path to save the JSON file 
folder_path = '/Users/iani.kuli/Desktop/alg_v4/Sensors_Data'
os.makedirs(folder_path, exist_ok=True)  # Create the folder if it doesn't exist

filename = 'data.json'
file_path = os.path.join(folder_path, filename)

# Function to clear the contents of a file
def clear_file(file_path):
    with open(file_path, 'w') as file:
        file.truncate()

# Clear the file once before starting to append data
clear_file(file_path)

# Initialize lists to store the data
Pn_data, Pn_plus_1_data, time_data = [], [], []

# Set up the plots with 2 subplots for Pn and Pn_plus_1
fig, axs = plt.subplots(2, 1, figsize=(10, 9))  # Adjusted for 2 graphs

lines = [axs[0].plot([], [], 'b-', label='Pn')[0],
         axs[1].plot([], [], 'g-', label='Pn+1')[0]]

# Set labels for each subplot
axs[0].set_ylabel('Pn')
axs[1].set_ylabel('Pn+1')
for ax in axs:
    ax.set_xlabel('Time')
    ax.legend()

axs[0].set_ylim(-0.2, 0.15)  
axs[1].set_ylim(-0.4, 0.3) 

def init():
    for line in lines:
        line.set_data([], [])
    return lines

def update_plot(frame):
    if ser.in_waiting:
        json_data = ser.readline().decode().strip()
        try:
            data = json.loads(json_data)
            # Extract and append new data
            Pn = data.get('Pn')
            Pn_plus_1 = data.get('Pn_plus_1')
            if all(isinstance(val, (float, int)) for val in [Pn, Pn_plus_1]):
                Pn_data.append(Pn)
                Pn_plus_1_data.append(Pn_plus_1)
                time_data.append(len(time_data))
                
                # Update plot data for each subplot
                lines[0].set_data(time_data, Pn_data)
                lines[1].set_data(time_data, Pn_plus_1_data)
                
                # Adjust limits for each subplot
                for ax in axs:
                    ax.relim()
                    ax.autoscale_view(True, True, True)
                
                # Append new data to the JSON file in NDJSON format
                with open(file_path, 'a') as file:
                    json_string = json.dumps(data, separators=(',', ':'))
                    file.write(json_string + '\n')
        except (json.JSONDecodeError, KeyError):
            pass
    return lines

ani = FuncAnimation(fig, update_plot, init_func=init, frames=MAX_FRAMES, interval=1000)
plt.tight_layout()
plt.show()
