export interface Employee {
  id: string;
  name: string;
  /**
   * @format email
   * @TJS-type string
   */
  email: string;
}

export interface ProviderData {
  /**
   * @format provider
   * @TJS-type string
   */
  provider: string;
  employees: Employee[];
}
