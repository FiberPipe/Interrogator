#ifndef CONFIG_H
#define CONFIG_H

const float ADC_VOLT_PER_UNIT_A = 2.384e-9;
const float ADC_VOLT_PER_UNIT_B = 2.384e-9;

const double lambda_ch_n = 1558.4;
const double lambda_ch_n_plus_1 = 1559.2;
const double delta_lambda = (lambda_ch_n_plus_1 - lambda_ch_n) / (2 * sqrt(2 * log(2)));

#endif // CONFIG_H