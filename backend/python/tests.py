
import json

import random
from solution import fizz_buzz
import cr_test

def actual_solution(n):
    answer = []

    for i in range(1, n + 1):

        divisible_by_3 = (i % 3 == 0)
        divisible_by_5 = (i % 5 == 0)

        if divisible_by_3 and divisible_by_5:
            answer.append("FizzBuzz")
        elif divisible_by_3:
            answer.append("Fizz")
        elif divisible_by_5:
            answer.append("Buzz")
        else:
            answer.append(i)

    return answer


randomInputs = []
for x in range(100):
    randomInputs.append(random.randint(1, 50))

class SubmissionTests(cr_test.TestGroup):
    def test_random_inputs(self):
        for randomInput in randomInputs:
            self.assert_equal(self, 
                                fizz_buzz(randomInput), 
                                actual_solution(randomInput)
                            )
        

print("RUvyqpOHw7", json.dumps(cr_test.TestGroup._TestGroup__run()))
