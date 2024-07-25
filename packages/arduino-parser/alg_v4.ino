#include <Arduino.h>
#include <math.h>
#include <ArduinoJson.h>
#include <HX711.h>
#include "config.h"
#include "functions.h"

// Declare the HX711 object
HX711 adc;

bool startReading = false; // Flag to control the start of the reading process

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // Wait for serial port to connect
  }

  Serial.println("HX711 voltage measurement setup...");

  // Initialize HX711
  adc.begin(4, 3);
  delay(500);

  if (adc.is_ready()) {
    Serial.println("HX711 is ready.");
    Serial.flush(); // Clear the serial buffer to ensure no previous data is present
    startReading = true; // Set the flag to true to start reading input
  } else {
    Serial.println("HX711 not found.");
    while (1) {
      delay(1000);
    }
  }
}

void loop() {
  if (!startReading) {
    return; // If the flag is not true, return and do not execute the rest of the loop
  }

  long sumA = 0;
  long sumB = 0;
  const int numReadings = 1;

  // Read and sum values for channel A
  adc.set_gain(128);
  for (int i = 0; i < numReadings; i++) {
    sumA += adc.read();
  }

  long averageValueA = sumA / numReadings;
  float Pn = averageValueA * ADC_VOLT_PER_UNIT_A * 40000;

  // Read and sum values for channel B
  adc.set_gain(32);
  for (int i = 0; i < numReadings; i++) {
    sumB += adc.read();
  }

  long averageValueB = sumB / numReadings;
  float Pn_plus_1 = averageValueB * ADC_VOLT_PER_UNIT_B * 40000;

  // Only proceed if both Pn and Pn_plus_1 are not NaN
  if (!isnan(Pn) && !isnan(Pn_plus_1)) {
    // Perform calculations
    double wavelength = calculateWavelength(abs(Pn), abs(Pn_plus_1));
    double displacement_mm = calculateDisplacement(wavelength);

    // Prepare JSON document
    DynamicJsonDocument doc(1024);
    doc["time"] = formatMillis(millis());
    // Check if wavelength is NaN and set "error" or the actual value accordingly
    if (isnan(wavelength)) {
        doc["wavelength"] = "error";
    } else {
        doc["wavelength"] = wavelength;
    }

    // Check if displacement_mm is NaN and set "error" or the actual value accordingly
    if (isnan(displacement_mm)) {
        doc["displacement"] = "error";
    } else {
        doc["displacement"] = displacement_mm;
    }
    doc["Pn"] = Pn;
    doc["Pn_plus_1"] = Pn_plus_1;

    String jsonString;
    serializeJson(doc, jsonString);
    Serial.println(jsonString);
  } else {
    Serial.println("Error: Pn or Pn_plus_1 is NaN, skipping JSON serialization.");
  }

  // Optionally, add a delay if needed
  delay(100);
}