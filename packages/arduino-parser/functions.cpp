#include "functions.h"
#include "config.h"

double calculateWavelength(double Pn, double Pn_plus_1) {
  if (Pn_plus_1 == 0 || Pn == 0) {
    Pn_plus_1 = 0.01;
    Pn = 0.01;
  }

  double ratio = Pn / Pn_plus_1;
  double f_lambda_c = abs(ratio);
  double sqrt_argument = 2 * f_lambda_c;
  if (sqrt_argument < 0) {
    return NAN;
  }
  double lambda = (Pn * lambda_ch_n + Pn_plus_1 * lambda_ch_n_plus_1) / (Pn + Pn_plus_1);
  return lambda;
}

double calculateDisplacement(double wavelength) {
  if (isnan(wavelength)) {
    return NAN;
  }

  double central_wavelength = (lambda_ch_n + lambda_ch_n_plus_1) / 2;
  double displacement_nm = wavelength - central_wavelength;
  double displacement_mm = displacement_nm / 1;
  return displacement_mm;
}

String formatMillis(unsigned long milliseconds) {
  unsigned long hours = (milliseconds / 3600000) % 24;
  unsigned long mins = (milliseconds / 60000) % 60;
  unsigned long secs = (milliseconds / 1000) % 60;
  unsigned long msecs = milliseconds % 1000;

  char timestamp[15];
  sprintf(timestamp, "%02lu:%02lu:%02lu.%03lu", hours, mins, secs, msecs);
  return String(timestamp);
}