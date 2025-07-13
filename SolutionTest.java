// This is the CORRECTED content for your Test.java file

// JUnit 5 imports for creating tests
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

// We need ArrayList and Arrays for this test
import java.util.ArrayList;
import java.util.Arrays;

class SolutionTest {

    // This test is named to be worth 100 points, following our convention.
    @Test
    void checkCarListCreation_Points_100() {
        // --- Setup: Create an instance of the student's Solution class ---
        Solution studentSolution = new Solution();

        // --- Execution: Call the method we want to test ---
        ArrayList<String> actualResult = studentSolution.createCarList();

        // --- Assertion: Check if the returned list is correct ---

        // Create the list we expect to get back
        ArrayList<String> expectedResult = new ArrayList<String>(Arrays.asList("Volvo", "BMW", "Ford", "Mazda"));

        // Use JUnit's assertEquals to compare the two lists.
        // The default .equals() for ArrayList checks for content and order.
        assertEquals(expectedResult, actualResult, "The returned list of cars did not match the expected list.");
    }
}
