#include <SoftwareSerial.h>

/*
    Basculas Testbench
*/

float height = 1.72; // In meters
float weight = 48.61; // In kilograms
int credit = 0; // In CRC
int price = 0; // Service's price

SoftwareSerial mySerial(10, 11); // RX, TX
void setup() {
  // put your setup code here, to run once:
  mySerial.begin(9600);
  pinMode(2, INPUT); // Debugger PIN - When it is 1, credit is completed
}

void loop() {
  // Send data each 3 seconds
  delay(3000);
  // Receiving price
  if(mySerial.available() > 0)
  {
    String msg = mySerial.readString();  
    price = msg.toInt();
  }
  if(digitalRead(2))
  {
    mySerial.print(price);
    mySerial.print(",");
    mySerial.print("1");
    mySerial.print(",");
    mySerial.print(height);
    mySerial.print(",");
    mySerial.println(weight);  
    price = 0;
  }
  else
  {
    mySerial.print(price/2);
    mySerial.print(",");
    mySerial.print("0");
    mySerial.print(",");
    mySerial.print(height);
    mySerial.print(",");
    mySerial.println(weight);  
  }
  
}

