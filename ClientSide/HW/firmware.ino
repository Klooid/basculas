/*
------------------------------------------------------------------------------------------------------------------------------------
  Klooid Innovations
  Departamentos de Energia e Innovacion
  Codigo de servidor de basculas para control de videos
  Desarrollado por:
    - Luis Leon (Diseño electrónico. Desarrollo web Backend y Arduino)
    - Christopher Quiros (Diseño web. Desarrollo web Frontend)
  Horas invertidas: 
    13-05-2017 - 3H

  Anotacion: probar
------------------------------------------------------------------------------------------------------------------------------------
*/

// Variables del sensor de pesado
float valor_peso_de_zero = 0;
const int analog_pin_input = 0;       // Entrada del sensor de peso en A0

// Variables del sensor de altura
float valor_altura_de_zero = 0;
const int height_resolution = 57.9;   //  Resolucion de 57.9us/cm
const int pwm_pin_height_sensor = 10; //  Sensor de altura en Pin D10

// Variables de precio solicitado
int costo_servicio = 0;

// Variables vinculadas al monedero
int coinInt = 0; // En pin 2
bool readingCoin = false;
int cntpulses = 0;
const unsigned int retardoMax_coin = 1000; // 1000 ms

// Tiempo de ejecucion
int credito = 0;
unsigned long previousMillis = 0;
unsigned long currentMillis = 0;
const long intervalo_de_chequeo = 1700;


void setup()
{
  // Configuracion del puerto serial
  Serial.begin(9600);
  Serial.println("Inicializando...");
  // Valor de zero en el sensor de pesado
  for (int x = 0; x <= 50; x++) {
    valor_peso_de_zero = (valor_peso_de_zero + getZero(analog_pin_input, 0.0722)) / 2;
    delay(10);
  }
  // Valor de zero en el sensor de altura
  for (int x = 0; x <= 50; x++) {
    valor_altura_de_zero = (valor_altura_de_zero + getHeight(pwm_pin_height_sensor,0, height_resolution)) / 2;
    delay(10);
  }
  // Vincular interrupcion
  attachInterrupt(coinInt, coinInserted, RISING);

}

/*
  Rutina principal
*/

void loop()
{
  // Variables locales
  unsigned double sum_weight = 0;
  unsigned double sum_height = 0;
  float weight = 0;
  float height = 0;

  // Realizar el servicio o enviar ping
  if(costo_servicio <= credito && costo_servicio != 0)
  {
    // Retardo para que el usuario se suba
    delay(3000); // Tiene 3 segundos para subirse
    // Medir sensores
    for(int i = 0; i < 50; i++)
    {
      sum_weight += getWeight(analog_pin_input, valor_peso_de_zero, 0);
      sum_height += getHeight(pwm_pin_height_sensor, valor_altura_de_zero, height_resolution);
    }
    weight = sum_weight/50;
    height = sum_height/50;
    // Enviar
    enviarResultados(1,credito,height,weight);
    // Resetear contadores
    costo_servicio = 0;
    credito = 0;
  }
  else if(!readingCoin)
  {
    pingSerial();
    delay(10);
  }

  // Verificando monedas
  if((millis() - previousMillis) > retardoMax_coin)
  {
    // Cuantificar la moneda en credito
    if(cntpulses == 1)
      credito += 50;
    else if(cntpulses == 3)
      credito += 100;
    else if(cntpulses == 7)
      credito += 500;
    else
      errorSerial();
    // Resetear la cantidad de pulsos y el readingCoin
    readingCoin = false;
    cntpulses = 0;
    // Enviar reporte
    enviarResultados(0, credito, height, weight);
  }

}

/*
  ISR (Intteruption Service Routine)
*/

void coinInserted()
{
  if(!readingCoin)
  {
    previousMillis = millis();
    readingCoin = true;
  }
  cntpulses++;
}


/*
  Funciones para sensor de pesado
*/

float getWeight(int PIN, float Zero, float VoltageRelation)
{
  // Leer el ADC
  int adcRead = analogRead(PIN);
  // Convertir a peso
  float Weight = adcRead * 0.1889 - Zero; // Peso calibrado
  // Retardo
  delay(10);
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

/*
  Funciones para el sensor de altura
*/

float getHeight(int PIN, float Zero, float HeightResolution)
{
  // Timeout de 50ms
  unsigned long duration = 0;
  // Leer el sensor de altura
  duration = pulseIn(PIN,HIGH,50000);
  // Convertir a altura
  height = abs(duration*HeightResolution - Zero);
  return height
}

/*
  Ingreso de serial
  Update:
    La sintaxis nueva es: P000\n - donde 000 es el precio
*/

String incomingMsg = "";

void serialEvent() {
  while (Serial.available()) {
      // Leer el puerto serial
      String msg = Serial.readString();
      if(msg.indexOf('\n') < 0)
        incomingMsg += msg;
      else
      {
        // Hacer corte del string
        incomingMsg += msg;
        int indexP = incomingMsg.indexOf('P');
        int indexN = incomingMsg.indexOf('\n');
        incomingMsg = incomingMsg.substring(indexP + 1, indexN);
        // Convertir a int
        costo_servicio = incomingMsg.toInt();
        // Restaurar string
        incomingMsg = "";
      }
  }
}

/*
  Envio serial
*/
void enviarResultados(int Success, int Credit, float Height, float Weight)
{
  Serial.print("R,");
  Serial.print(Success);
  Serial.print(",");
  Serial.print(Credit);
  Serial.print(",");
  Serial.print(Height)
  Serial.print(",");
  Serial.print(Weight);
  Serial.println(",");
}

void pingSerial()
{
  Serial.println("P");
}

void errorSerial()
{
  Serial.println("E");
}