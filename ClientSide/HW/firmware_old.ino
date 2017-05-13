/*
  VERSION NO PROBADA COMPLETAMENTE
*/

#include <Ultrasonic.h>

#define TRIGGER_PIN  12
#define ECHO_PIN     13

Ultrasonic ultrasonic(TRIGGER_PIN, ECHO_PIN);

const int coinInt = 0; //Interrupción 0, vinculada con el pin D2
const int reset_button = 8;

volatile float coinsValue = 0.00;
int cuenta_permanente = 0;
int coinsChange = 0;

int coin_readed = LOW;
unsigned long previousMillis = 0;
unsigned long currentMillis = 0;
const long intervalo_de_chequeo = 1700;

int costo_del_servicio = 200;
boolean medir = false;

unsigned long milisegundos_previos = 0;
const long intervalo_de_envio_al_orange = 1000;

String inputString = "";
boolean stringComplete = false;
int numero_entrante = 0;

/*
   Distribución de la cadena
   cadena_a_enviar : "Credito_en_monedas","Pago_Completo_0_o_1", "longitud_medida", "peso_medido"
*/



String cadena_a_enviar;
float valor_de_zero = 0;
const int analog_pin_input = 0;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  inputString.reserve(200);
  attachInterrupt(coinInt, coinInserted, RISING);
  pinMode(reset_button, INPUT);

  //delay(5000);
  for (int x = 0; x <= 50; x++) {
    valor_de_zero = (valor_de_zero + getZero(analog_pin_input, 0.0722)) / 2;
    delay(10);
  }
  delay(100);
  //Serial.print("Listo ");
  //Serial.println(valor_de_zero);
}

void coinInserted() {
  coinsValue = coinsValue + 1;
  coinsChange = 1;
  previousMillis = millis();
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    int numero = int(inChar) - 48;
    if (0 <= numero && numero <= 9) {
      numero_entrante = numero_entrante * 10 + numero;
    }
    inputString += inChar;
    if (inChar == '\n') {
      stringComplete = true;
    }
  }
}

void loop() {

  if (stringComplete) {
    //Serial.print("Costo: ");
    inputString = "";
    stringComplete = false;
    costo_del_servicio = numero_entrante;
    numero_entrante = 0;
    //Serial.println(costo_del_servicio);
  }

  currentMillis = millis();

  if (currentMillis - milisegundos_previos > intervalo_de_envio_al_orange) {
    milisegundos_previos = currentMillis;
    //========================================
    //OBTENER EL PESO
    float peso_medido = 0;
    for (int x = 1; x <= 750; x++) {
      peso_medido = (peso_medido + getWeight(analog_pin_input, valor_de_zero, 0.0722)) / 2;
      delay(2);
    }
    //========================================
    //Serial.println("Mandar datos");
    Serial.print(cuenta_permanente);
    Serial.print(",");
    if (medir) { //Significa que el pago por parte del usuario ha sido completado
      Serial.print("1");
      medir = false;
      delay(1000);
    } else {
      Serial.print("0");
    }
    Serial.print(",");
    float cmMsec = 0;
    cmMsec = getDistance();
    Serial.print(cmMsec);
    Serial.print(",");
    Serial.println(peso_medido);
  }

  if (coinsChange == 1) {
    if (currentMillis - previousMillis > 150) {
      previousMillis = currentMillis;
      if (coinsValue < 2) {
        //Serial.println("Es una moneda de 25");
        cuenta_permanente = cuenta_permanente + 25;
      } else if (2 <= coinsValue && coinsValue < 4) {
        //Serial.println("Es una moneda de 50");
        cuenta_permanente = cuenta_permanente + 50;
      } else if (4 < coinsValue) {
        //Serial.println("Es una moneda de 100");
        cuenta_permanente = cuenta_permanente + 100;
      }
      Serial.print("Total: ");
      Serial.println(cuenta_permanente);

      if (cuenta_permanente == costo_del_servicio) {
        Serial.println("PAGO COMPLETO");
        cuenta_permanente = 0;
        medir = true;
      }
      coinsChange = 0;
      coinsValue = 0;
    }
    //====================================
  }

  if (digitalRead(reset_button)) {
    coinsValue = 0;
    cuenta_permanente = 0;
    Serial.print("Reseteado: ");
    Serial.println(coinsValue);
    delay(1000);
  }
}



float getDistance () {
  float valor_promedio = 0;
  float valor_acumulado = 0;
  float distancia_cm = 0;
  int contador = 0;
  while (contador < 30) {
    long microsec = ultrasonic.timing();
    distancia_cm = ultrasonic.convert(microsec, Ultrasonic::CM);
    if (/*distancia_cm < 150*/true) {
      //Serial.print("CM: ");
      //Serial.println(distancia_cm);
      valor_acumulado = valor_acumulado + distancia_cm;
      contador++;
    }
    delay(10);
  }
  valor_promedio = valor_acumulado / contador;
  contador = 0;
  return valor_promedio;
}



//0.04 Kg por mV
//Comprar resistencias para montar el amplificador
/*
  Resistencias de 120K Ohm
  Capacitores de 0.1mF
  150 Ohm
  Diodo Germanio
*/

float getWeight(int PIN, float Zero, float VoltageRelation)
{
  // Leer el ADC
  int adcRead = analogRead(PIN);
  // Convertir a peso
  float Weight = adcRead * 0.1889 - Zero; // Peso calibrado
  // Retornar peso
  return Weight;

}

float getZero(int PIN, float VoltageRelation)
{
  // Leer el ADC
  int adcRead = analogRead(PIN);
  // Convertir a peso
  float Weight = adcRead * 0.1889; // Peso calibrado
  // Retornar peso
  return Weight;
}
