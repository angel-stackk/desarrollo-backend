export interface ISmsNotifier {
  sendSms(phoneNumber: string, message: string): Promise<boolean>;
}

// SDK de proveedor externo con interfaz no compatible
class TwilioLegacyClient {
  public async dispatchMessage(opts: { to: string; body: string; fromNumber: string }): Promise<{ status: string }> {
    // Invocación del SDK de Twilio
    return { status: 'delivered' };
  }
}

// Adaptador que homologa la interfaz esperada por el dominio PMS
export class TwilioSmsAdapter implements ISmsNotifier {
  private twilioClient: TwilioLegacyClient;
  private fromNumber: string;

  constructor(fromNumber: string) {
    this.twilioClient = new TwilioLegacyClient();
    this.fromNumber = fromNumber;
  }

  public async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const response = await this.twilioClient.dispatchMessage({
        to: phoneNumber,
        body: message,
        fromNumber: this.fromNumber
      });
      return response.status === 'delivered';
    } catch (error) {
      console.error('Error en TwilioSmsAdapter:', error);
      return false;
    }
  }
}
