import Author, {IAuthor} from "../models/author";
import app from "../server";
import request from "supertest";


describe("Test the /authors GET service", () => {
    let consoleSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {
        });
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });


    it("Service responds with a list of author names sorted by family name", async () => {

        const mockAuthors = [
            {
                first_name: 'Kim',
                family_name: 'Woon',
                date_of_birth: new Date('1958-10-10'),
                date_of_death: new Date('2020-01-01')
            },
            {
                first_name: 'Moon',
                family_name: 'Sen',
                date_of_birth: new Date('1964-05-21')},
            {
                first_name: 'John',
                family_name: 'Woon',
                date_of_birth: new Date('1989-01-09'),
                date_of_death: new Date('2020-01-01')
            },
            {
                first_name: 'Moon',
                family_name: 'Sen',
                date_of_birth: new Date('1992-12-27')
            }];


        const expected = [...mockAuthors]
            .map(author => new Author(author))
            .sort((a, b) => b.family_name.localeCompare(a.family_name))
            .map(a => `${a.name} : ${a.lifespan}`);


        Author.getAllAuthors = jest.fn().mockImplementation((sortOpts?: { [key: string]: 1 | -1 }) => {
            if (sortOpts && sortOpts.family_name == 1) {
                return Promise.resolve(expected)
            }
            return Promise.resolve(mockAuthors)
        });

        const response = await request(app).get("/authors");

        expect(response.body).toStrictEqual(expected);
        expect(response.status).toBe(200);
    });

    it("Service responds 'No authors found' if there are no authors in the db", async () => {
        Author.getAllAuthors = jest.fn().mockResolvedValueOnce([]);
        const response = await request(app).get("/authors");
        expect(response.status).toBe(200);
        expect(response.text).toBe("No authors found");
    });

    it("Service responds 500 if there is an error retrieving authors", async () => {
        Author.getAllAuthors = jest.fn().mockRejectedValueOnce(new Error("Database Error"));
        const response = await request(app).get("/authors");
        expect(response.status).toBe(500);
        expect(consoleSpy).toHaveBeenCalled();
    });
});
