import serialport from 'serialport';

export class SerialPort {
    static async list() {
        return serialport.list();
    }
}
