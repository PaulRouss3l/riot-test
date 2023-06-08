export interface Emails {
  /**
   * @format email
   * @TJS-type string
   */
  address: string;
  isPrimary: boolean;
}

export interface Employee {
  id: string;
  name: string;
  /**
   * @format email
   * @TJS-type string
   */
  email?: string;
  emails?: Emails[];
}

export interface ProviderData {
  /**
   * @format provider
   * @TJS-type string
   */
  provider: string;
  employees: Employee[];
}
