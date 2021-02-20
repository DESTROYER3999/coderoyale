import sys
import inspect
import random
import string

class TestGroup(object):
    results = {}

    @staticmethod
    def __make_id(length):
        chars = string.ascii_letters + "0123456789"
        result = ""
        for x in range(length):
            result += random.choice(chars)
        return result

    @staticmethod
    def __update_results(assertion, cls, result, **kwargs):
        func_name = inspect.getframeinfo(sys._getframe().f_back.f_back)[2]
        if func_name not in TestGroup.results[cls.__name__]:
            TestGroup.results[cls.__name__][func_name] = []
        TestGroup.results[cls.__name__][func_name].append({**{
            "assertion": assertion,
            "result": f"{repr(result)}"
        }, **{key: repr(kwargs[key]) for key in kwargs}})

    @staticmethod
    def __run():
        for subClass in TestGroup.__subclasses__():
            TestGroup.results[subClass.__name__] = {}
            for var in vars(subClass):
                if callable(vars(subClass)[var]):
                    vars(subClass)[var](subClass)
        return TestGroup.results

    @staticmethod
    def assert_equal(cls, a, b):
        result = (a == b)
        TestGroup.__update_results("equal", cls, result, a=a, b=b)
        return result
    @staticmethod
    def assert_not_equal(cls, a, b):
        result = (a != b)
        TestGroup.__update_results("not_equal", cls, result, a=a, b=b)
        return result
    @staticmethod
    def assert_true(cls, x):
        result = (bool(x) is True)
        TestGroup.__update_results("true", cls, result, x=x)
        return result
    @staticmethod
    def assert_false(cls, x):
        result = (bool(x) is False)
        TestGroup.__update_results("false", cls, result, x=x)
        return result
    @staticmethod
    def assert_is(cls, a, b):
        result = (a is b)
        TestGroup.__update_results("is", cls, result, a=a, b=b)
        return result
    @staticmethod
    def assert_is_not(cls, a, b):
        result = (a is not b)
        TestGroup.__update_results("is_not", cls, result, a=a, b=b)
        return result
    @staticmethod
    def assert_is_none(cls, x):
        result = (x is None)
        TestGroup.__update_results("is_none", cls, result, x=x)
        return result
    @staticmethod
    def assert_is_not_none(cls, x):
        result = (x is not None)
        TestGroup.__update_results("is_not_none", cls, result, x=x)
        return result
    @staticmethod
    def assert_in(cls, a, b):
        result = (a in b)
        TestGroup.__update_results("in", cls, result, a=a, b=b)
        return result
    @staticmethod
    def assert_not_in(cls, a, b):
        result = (a not in b)
        TestGroup.__update_results("not_in", cls, result, a=a, b=b)
        return result
    @staticmethod
    def assert_is_instance(cls, a, b):
        result = (isinstance(a, b))
        TestGroup.__update_results("is_instance", cls, result, a=a, b=b)
        return result
    @staticmethod
    def assert_not_is_instance(cls, a, b):
        result = (not isinstance(a, b))
        TestGroup.__update_results("not_is_instance", cls, result, a=a, b=b)
        return result
