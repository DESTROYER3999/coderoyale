import cr_test
from solution import sum_double

class ExampleTests(cr_test.TestGroup):
    def test_1(self):
        self.assert_equal(self, sum_double("1 2"), 3)
        self.assert_equal(self, sum_double("3 2"), 5)
        self.assert_equal(self, sum_double("2 2"), 8)
    def test_2(self):
        self.assert_equal(self, sum_double("1 2"), 3)
        self.assert_equal(self, sum_double("3 2"), 5)
        self.assert_equal(self, sum_double("2 2"), 8)
class ExampleTests2(cr_test.TestGroup):
    def test_1(self):
        self.assert_equal(self, sum_double("1 2"), 3)
        self.assert_equal(self, sum_double("3 2"), 5)
        self.assert_equal(self, sum_double("2 2"), 8)
    def test_2(self):
        self.assert_equal(self, sum_double("1 2"), 3)
        self.assert_equal(self, sum_double("3 2"), 5)
        self.assert_equal(self, sum_double("2 2"), 8)

cr_test.run()

