import xml.etree.ElementTree as ET
import json, sys

def parse_junit_xml(xml_file_path):
    test_results = []
    total_tests = 0; passed_tests = 0
    try:
        tree = ET.parse(xml_file_path)
        for testcase in tree.getroot().findall('testcase'):
            total_tests += 1
            test_name = testcase.get('name')
            result = {"name": test_name, "status": "passed", "message": ""}
            failure = testcase.find('failure')
            if failure is not None:
                result["status"] = "failed"
                result["message"] = failure.get('message')
            else:
                passed_tests += 1
            test_results.append(result)
        score = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        return {"overallScore": round(score, 2), "tests": test_results}
    except Exception as e:
        return {"error": f"Failed to parse XML report: {str(e)}"}

if __name__ == "__main__":
    results = parse_junit_xml(sys.argv[1])
    with open(sys.argv[2], 'w') as f:
        json.dump(results, f, indent=2)