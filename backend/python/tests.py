
import json

import random
from solution import solution_func
import cr_test

def actual_solution(x):
    return x


randomInputs = []
for x in range(100):
    randomInputs.append(random.randint(0, 50))

class SubmissionTests(cr_test.TestGroup):
    def test_random_inputs(self):
        for randomInput in randomInputs:
            self.assert_equal(self, 
                                solution_func(randomInput), 
                                actual_solution(randomInput)
                            )

        

print("NNcM8HL8Ou", json.dumps(cr_test.TestGroup._TestGroup__run()))
