/** Klasa reprezentująca dane użytkownika */


export class UserData {

    static current: UserData; // bieżąco zalogowany użytkownik
    static factory: (data: Object) => UserData = (data) => new UserData();

    id: any;
    firstname: string;
    lastname: string;
    displayName: string;
    email: string;

    constructor(data) {
        //ToDo: Przepisać dane
    }

}