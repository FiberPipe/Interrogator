#ifndef FUNCTIONS_H
#define FUNCTIONS_H

#include <Arduino.h>

double calculateWavelength(double Pn, double Pn_plus_1);
double calculateDisplacement(double wavelength);
String formatMillis(unsigned long milliseconds);

#endif // FUNCTIONS_H