
import json

import random
from solution import ree
import cr_test

def actual_solution(n):
    result = []
    for x in range(n):
        result.append("ree")
    return result

randomPositive = []
randomNegative = []

for x in range(20):
    randomPositive.append(random.randint(0, 100))

for x in range(5):
    randomNegative.append(random.randint(-10, 0))


class ReeSubmissionTests(cr_test.TestGroup):
    def test_random_positive(self):
        for randomInput in randomPositive:
            self.assert_equal(self, 
                                ree(randomInput), 
                                actual_solution(randomInput)
                            )

    def test_random_negative(self):
        for randomInput in randomNegative:
            self.assert_equal(self, 
                                ree(randomInput), 
                                actual_solution(randomInput)
                            )
    
    def test_zero(self):
        self.assert_equal(self, 
                            ree(0), 
                            actual_solution(0)
                        )


        

print("PaPmAFvQBB", json.dumps(cr_test.TestGroup._TestGroup__run()))
