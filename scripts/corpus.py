"""Original training corpus for Inside an LLM.

All text here is written for this project. Nothing is copied from the source
video, the FT piece, or any other work. Three corpora:

- STORIES: simple children's-story sentences. Feeds the tokenizer, the
  embedding model, and the tiny transformer (acts 4-7).
- RELATIONS: paired sentences that place words in parallel contexts so the
  embedding model can learn analogies (king:queen :: man:woman, etc.) (act 5).
- PROSE: plain English sentences used only to gather letter statistics for the
  Shannon next-letter demo (act 2).
"""

STORIES = [
    "once upon a time there was a small king who lived in a stone castle",
    "the young prince rode his horse across the green field to the river",
    "a kind queen ruled the land with a warm and gentle heart",
    "the little princess found a golden key beneath the old oak tree",
    "every night the king read a story to the sleepy prince",
    "the brave knight crossed the dark forest to reach the tall tower",
    "a clever fox lived near the river and watched the fish swim by",
    "the old man told the children a tale about a giant and a bean",
    "the girl walked to the market to buy bread and fresh milk",
    "a gray wolf howled at the moon while the village slept",
    "the queen planted red roses in the garden behind the castle",
    "the prince and the princess danced in the great golden hall",
    "a tiny mouse hid a piece of cheese under the wooden floor",
    "the farmer woke at dawn to feed the pigs and the brown cow",
    "the sailor steered his boat through the storm toward the shore",
    "a wise owl sat in the oak tree and blinked at the passing crowd",
    "the baker made warm bread and sold it at the busy market",
    "the child chased a bright butterfly across the sunny meadow",
    "the king gave the poor farmer a bag of gold and a fine horse",
    "the dragon slept on a pile of gold deep inside the mountain",
    "a small dog followed the girl all the way home from school",
    "the moon rose over the quiet sea as the fishermen came home",
    "the old woman lived in a cottage at the edge of the deep wood",
    "the boy climbed the hill to watch the sun set behind the town",
    "a river ran through the valley past the mill and the stone bridge",
    "the cat sat by the fire and watched the snow fall outside",
    "the merchant sailed far across the sea to trade silk and spice",
    "the young queen learned to rule the kingdom with courage and care",
    "a shepherd led his sheep up the mountain to the high green pasture",
    "the children built a small boat and sailed it on the pond",
    "the knight returned to the castle with the lost golden crown",
    "a gentle rain fell on the fields and the farmers were glad",
]

RELATIONS = [
    "the king is a man who rules the kingdom",
    "the queen is a woman who rules the kingdom",
    "the prince is a young man of royal blood",
    "the princess is a young woman of royal blood",
    "a boy is a young man who likes to play",
    "a girl is a young woman who likes to play",
    "the man walked into the town at night",
    "the woman walked into the town at night",
    "the king wore a golden crown on his head",
    "the queen wore a golden crown on her head",
    "a father is a man with a son or a daughter",
    "a mother is a woman with a son or a daughter",
    "the actor is a man who performs on the stage",
    "the actress is a woman who performs on the stage",
    "the uncle is a man in the family",
    "the aunt is a woman in the family",
    "the prince will be king when he grows up",
    "the princess will be queen when she grows up",
    "he is a strong man and a brave knight",
    "she is a strong woman and a brave knight",
    "the son is a boy in the royal family",
    "the daughter is a girl in the royal family",
    "a gentleman is a polite man at the party",
    "a lady is a polite woman at the party",
    "the man is the husband of the woman",
    "the woman is the wife of the man",
    "the boy grew into a tall young man",
    "the girl grew into a tall young woman",
    "a waiter is a man who serves the food",
    "a waitress is a woman who serves the food",
]

PROSE = [
    "the quick brown fox jumps over the lazy dog every morning",
    "she sells fresh bread at the market near the river bridge",
    "the weather turned cold and the leaves fell from the trees",
    "children learn to read by sounding out one letter at a time",
    "the letter after t and h is very often the letter e",
    "language has a hidden pattern that we rarely stop to notice",
    "when you read a sentence you can guess the next word with ease",
    "the more you know about a word the less it can surprise you",
    "common words appear again and again in ordinary writing",
    "a good story keeps you guessing what will happen next",
    "the sound of the rain on the roof made the house feel warm",
    "he opened the heavy door and stepped into the quiet room",
    "the train left the station and rolled past the sleeping town",
    "a small light shone in the window at the top of the stairs",
    "she wrote a long letter to her friend across the wide sea",
    "the garden was full of flowers in every shade of red and gold",
    "we walked along the shore and watched the tide come slowly in",
    "the teacher wrote a single word on the board and asked us to read",
    "every language on earth is built from a handful of sounds",
    "the printed page holds meaning that the eye can gather at a glance",
    "patterns in text are what a machine learns to copy and extend",
    "the next letter is rarely a surprise once you have enough context",
    "a sentence is a chain of choices each one shaped by the last",
    "the old clock on the wall ticked through the long quiet night",
    "practice makes the hardest task feel simple after enough time",
    "the river bent around the hill and vanished into the morning mist",
    "words that mean similar things tend to appear in similar places",
    "you shall know a word by the company that it tends to keep",
    "the market opened at dawn and closed when the sun went down",
    "a careful reader can finish a familiar sentence without looking",
]


# Parallel sentences for the analogy demo. The trick that makes king - man +
# woman land on queen: each of the four corners must differ along exactly two
# controlled axes. Here the GENDER axis is carried by the pronoun (his/her) and
# the RANK axis by royal-vs-common context words. Templates are otherwise
# identical, so the learned vectors form a clean parallelogram.
#
# word     = rank        + gender
# king     = royal       + his        prince   = royal + young + his
# queen    = royal       + her        princess = royal + young + her
# man      = common      + his        boy      = common + young + his
# woman    = common      + her        girl     = common + young + her

# (word, pronoun, is_young); rank comes from which template set we use
_ROYAL_WORDS = [("king", "his", False), ("queen", "her", False),
                ("prince", "his", True), ("princess", "her", True)]
_COMMON_WORDS = [("man", "his", False), ("woman", "her", False),
                 ("boy", "his", True), ("girl", "her", True)]

_ROYAL_TEMPLATES = [
    "the {y}{x} ruled {p} kingdom from the golden throne",
    "the {y}{x} wore {p} shining crown inside the palace",
    "the {y}{x} sat upon {p} royal throne at dawn",
    "every servant bowed before the {y}{x} and {p} crown",
    "the {y}{x} led {p} noble court through the castle",
    "the {y}{x} signed {p} royal decree with a golden pen",
]
_COMMON_TEMPLATES = [
    "the {y}{x} did {p} work in the open field",
    "the {y}{x} walked to {p} small cottage after dark",
    "the {y}{x} carried {p} basket to the busy market",
    "the {y}{x} finished {p} chores before the night",
    "the {y}{x} sold {p} bread at the village stall",
    "the {y}{x} mended {p} plain coat by the fire",
]


def _emit(words, templates):
    out = []
    for word, pron, young in words:
        y = "young " if young else ""
        for t in templates:
            out.append(t.format(x=word, p=pron, y=y))
    return out


def build_analogy_corpus():
    return _emit(_ROYAL_WORDS, _ROYAL_TEMPLATES) + _emit(_COMMON_WORDS, _COMMON_TEMPLATES)


def all_text():
    return STORIES + RELATIONS + PROSE
