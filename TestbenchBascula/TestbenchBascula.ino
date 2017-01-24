/*
    Basculas Testbench
*/

float height = 1.72; // In meters
float weight = 48.61; // In kilograms
int credit = 0; // In CRC
int price = 0; // Service's price
 
void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(2, INPUT); // Debugger PIN - When it is 1, credit is completed
}

void loop() {
  // Send data each 3 seconds
  delay(3000);
  // Receiving price
  if(Serial.available() > 0)
  {
    String msg = Serial.readString();  
    price = msg.toInt();
  }
  if(digitalRead(2))
  {
    Serial.print(price);
    Serial.print(",");
    Serial.print("1");
    Serial.print(",");
    Serial.print(height);
    Serial.print(",");
    Serial.println(weight);  
    price = 0;
  }
  else
  {
    Serial.print(price/2);
    Serial.print(",");
    Serial.print("0");
    Serial.print(",");
    Serial.print(height);
    Serial.print(",");
    Serial.println(weight);  
  }
  
}

