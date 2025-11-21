import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FacilityService, FacilityDTO } from './facility.service';

describe('FacilityService', () => {
    let service: FacilityService;
    let httpTestingController: HttpTestingController;
    const apiUrl = '/api/facilities';
    // Define a mock token for testing the Authorization header
    const mockToken = 'test-access-token';

    beforeEach(() => {
        // Mock the localStorage getItem for the token
        spyOn(localStorage, 'getItem').and.returnValue(mockToken);

        TestBed.configureTestingModule({
            // 1. Provides a mock HttpClient to resolve the NG0201 error
            imports: [HttpClientTestingModule],
            providers: [FacilityService]
        });

        // Inject the service and the testing controller
        service = TestBed.inject(FacilityService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        // Ensures that no unexpected real HTTP requests are made during tests
        httpTestingController.verify();
    });

    // Test 1: Ensure the service can be successfully created (basic check)
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // Test 2: Test the getAllFacilities() method
    it('should call getAllFacilities and return an array of facilities', () => {
        const mockFacilities: FacilityDTO[] = [
            { id: 1, name: 'Main Hall', type: 'Venue', building: 'A', floor: '1', capacity: 100, description: '', imageUrl: '', status: 'Available' }
        ];
        const mockResponse = { success: true, message: 'Success', data: mockFacilities };

        service.getAllFacilities().subscribe(facilities => {
            // 3. Assert the expected data from the service method
            expect(facilities).toEqual(mockFacilities);
            expect(facilities.length).toBe(1);
        });

        // 2. Intercepts the request to prevent the 'status: 0' error
        const req = httpTestingController.expectOne(apiUrl);

        // Check the HTTP method and headers
        expect(req.request.method).toBe('GET');
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

        // Respond to the request with mock data
        req.flush(mockResponse);
    });

    // Test 3: Test a method that requires an ID
    it('should call deleteFacility and handle success', () => {
        const facilityId = 5;

        service.deleteFacility(facilityId).subscribe(response => {
            expect(response).toBeUndefined();
        });

        const req = httpTestingController.expectOne(`${apiUrl}/${facilityId}`);

        expect(req.request.method).toBe('DELETE');

        // Respond with a minimal success response (e.g., status 204 No Content)
        req.flush({ success: true, message: 'Deleted', data: null }, { status: 204, statusText: 'No Content' });
    });

    // TODO: Add more tests here for other methods: getAvailableFacilities, createFacility, updateFacility, etc.
});