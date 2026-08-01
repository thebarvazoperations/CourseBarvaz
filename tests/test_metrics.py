from coursebarvaz.models import Company, Market, Metrics


def make(**kw) -> Company:
    base = dict(ticker="X", name="X", market=Market.JAPAN, market_cap=100.0, book_value=200.0)
    base.update(kw)
    return Company(**base)


def test_pb_and_net_cash():
    c = make(market_cap=100, book_value=200, cash_and_equivalents=60, total_debt=10)
    m = Metrics.of(c)
    assert m.pb_ratio == 0.5
    assert m.net_cash == 50
    assert m.net_cash_to_mcap == 0.5


def test_zero_book_value_gives_none_pb():
    m = Metrics.of(make(book_value=0))
    assert m.pb_ratio is None


def test_profitability_flags():
    assert Metrics.of(make(net_income=1, operating_income=1)).is_profitable
    assert not Metrics.of(make(net_income=-1)).is_profitable
    assert not Metrics.of(make(operating_income=-1)).is_operationally_profitable


def test_debt_free_is_net_cash():
    assert Metrics.of(make(cash_and_equivalents=10, total_debt=5)).is_debt_free
    assert not Metrics.of(make(cash_and_equivalents=5, total_debt=10)).is_debt_free
