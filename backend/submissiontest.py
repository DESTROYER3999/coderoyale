import random
from solution import sum_double
import cr_test

def actual_solution(numStr):
    num1 = int(numStr.split()[0])
    num2 = int(numStr.split()[1])
    if num1 == num2:
        return 2 * (num1 + num2)
    return num1 + num2

randomInputs = []
for x in range(100):
    randomInputs.append(f"{random.randint(1, 20)} {random.randint(1, 20)}")

class SubmissionTests(cr_test.TestGroup):
    def test_random_inputs(self):
        for randomInput in randomInputs:
            self.assert_equal(self, 
                                sum_double(randomInput), 
                                actual_solution(randomInput)
                            )
print(randomInputs)
# cr_test.run()

