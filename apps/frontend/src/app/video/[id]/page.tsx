"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ThemeToggle } from "@/components/theme-toggle"
import { Maximize2, Minimize2 } from "lucide-react"
import ContentCard from "@/components/content-card"

// Hardcoded content for testing
const CONTENT_TABLE = [
  {
    chapter: "Function vs. Class for Simple Operations",
    summary:
      "Avoid using a class when a simple function will suffice. Classes should be reserved for situations with multiple methods, data access needs, and multiple instances. Using functions simplifies the code and reduces boilerplate.",
    transcript: [
      {
        end: 79.88,
        start: 0.12,
        text: "is your objectoriented python code turning into unmanageable spaghetti today I&amp;#39;ll cover bad practices to avoid at all costs and what to do instead the first bad practice is that you have a function masquerading as a class and this actually quite common where you start using a class in this particular example we have data loader class and actually when you look at this this data loader class very simple it just has one method and an initializer if you are sure that you&amp;#39;re going to add more methods to the class that there is data that these methods all need access to that you need multiple instances of this class then it makes sense to use a class if not just use a function instead in this case there is no need for us to have a data loader class we can turn this into a function let&amp;#39;s do that right now so then what I&amp;#39;ll do is I take this method I&amp;#39;ll de inent this and instead of self we simply pass the file path and this is by the way an object of type path from path lip so self is no longer needed here and then I can remove this whole class here and the nice thing about this is that I now no longer need to create an instance before I can actually use it I can simply do load and then I pass the data that it",
      },
    ],
  },
  {
    chapter: "Modules vs. Classes with Static Methods",
    summary:
      "Instead of using classes with static methods for utility functions, leverage Python modules. Modules provide a cleaner way to organize code without the overhead of class instantiation or static method calls.",
    transcript: [
      {
        end: 387.599,
        start: 79.92,
        text: "needs like so this has simplified the code a lot let me run this just to make sure it works and it does this is the data that it has loaded from the file if you&amp;#39;re using classes a lot in this way just containers for methods that often adds unnecessary complexity and boiler plate code because then you have to create an instance of the class to call that method an alternative is to add static methods but then you still have to do class name dot method instead of just calling the function if a class is very basic just has one method you can simply use a function which is also typically a bit easier to read the second example is sort of related to this this is another example of using a class where actually there&amp;#39;s a simple way to do it at least in Python so if you have this type of class in this case this is a string processor class that has a couple of helpful methods to do stuff with strings there is actually no reason to actually create an instance of this class right but if we want to call a method like counting words then let&amp;#39;s create a main function to write that then to call these methods I have to actually do string processor dot reverse and uppercase or remove files or count Words let me add that as well and let&amp;#39;s also run the code to see what it actually does so this is of course extremely useful but when you look at this the class and the static method decorators just add complication in Python you can use a module instead that&amp;#39;s code in a separate file that you then import elsewhere so in this particular example I could take this code and then I can past it in a different file called string utils and now I can simply remove the whole string process class and let me de indent this and now this is just a module in Python and now I can go here in this code and then I can do from string utils and then I&amp;#39;m going to import reverse and upgrade remove vowels and count Words and now I also no longer need the string processor class name here like so when on this again we get exactly the same result as before but now it&amp;#39;s in a separate module the reason you want to avoid using a class instead of a module is that it&amp;#39;s sort of a misleading use of objectoriented Concepts the whole idea for a class is that you create an instance of it and if you don&amp;#39;t need an instance of it then it&amp;#39;s debatable whether it&amp;#39;s really helpful to use a class for that in some languages like Java everything needs to be in a class so you have no choice well you could maybe switch to another programming language but that&amp;#39;s not always possible because of other constraints in Python I tend to start with function and modules instead of classes as I find that typically leads to simpler code only if you have data and closely associated Behavior or if you know you&amp;#39;re going to need multiple instances then a class is a good choice and by the way these are typical discussions that come up in software design if you want to learn more about what you need to consider when you&amp;#39;re designing your software check out my free design guide at ./ design guide this contains the seven steps that I take when I design a new piece of software hopefully this will help you avoid some of the mistakes that I made in the past r. codesign Gap the link is also in the description",
      },
    ],
  },
  {
    chapter: "Favor Composition over Inheritance",
    summary:
      "Avoid overly complex inheritance structures.  Instead of using inheritance to define roles, consider using composition with role classes or enums to reduce coupling and improve code maintainability.  Flattening hierarchies simplifies the code.",
    transcript: [
      {
        end: 563.68,
        start: 387.599,
        text: "the third bad practice is creating overly complex inheritance structures often people try to avoid or decouple code by using inheritance and this often just makes things worse there is a set of principles called the solid principles they&amp;#39;ve been proposed by Robert Martin the F specifically stands for the single responsibility principle now you want to split up code so that each part has its specific responsibility and inheritance is not really a good way to do that because you introduce a lot of coupling the subass is very much dependent on the super class so here I have an example where we have an employee class that has a get details method it&amp;#39;s very simple basic example of course you&amp;#39;ll normally have more complex things here but then I sort of abuse The Inheritance mechanism to describe the role of the particular employee so we have a manager we have a senior manager a director and the implementation of get details changes every time that determines the role when I run this we simply get this so it&amp;#39;s very basic but this is not really a good way to organize things I&amp;#39;m trying to use inheritance to describe a role and that&amp;#39;s not really a good way to go about it so it&amp;#39;s better to flatten the hierarchy and use composition instead of inheritance so what you could do here for example is instead of overriding this method to do something else depending on the subass we could also introduce a ro class or an enom actually so let me import a string enom and then I&amp;#39;m going to define a class Ro which is a string enom and that&amp;#39;s going to have an employee a manager a senior manager and a director and then instead of having all these different sub classes I&amp;#39;m going to delete all of these and I&amp;#39;m going to add an initializer",
      },
      {
        end: 409.199,
        start: 387.72,
        text: "here that gets a roll and we assign a role to the employee and then get details simply Returns the role or actually we can just do this like so that&amp;#39;s a bit shorter and now instead of creating these instances here we simply create employees with a specific",
      },
      {
        end: 563.68,
        start: 411.039,
        text: "role and now when we run this of course we get exactly the same result but now we no longer have this inheritance hierarchy we simply have an employee class single class that has a ro instance variable and that&amp;#39;s the basic idea of composition and this is of course a really simple example but as you add more inheritance hierarchies throughout your code that&amp;#39;s just going to increase complexity and it&amp;#39;s going to make it harder to maintain your code also it will be harder to understand and extend later because then for every new Ro type you&amp;#39;re going to need to introduce a new subass so composition typically is easier it&amp;#39;s simpler to set up simpler to manage so whenever ever you&amp;#39;re using inheritance really think about whether that&amp;#39;s actually the right way to go in many cases I can find a better solution that uses composition and by the way there&amp;#39;s another type of inheritance that&amp;#39;s used a lot in Python that&amp;#39;s in my opinion even worse than this so make sure you stick around until the end of the video where I&amp;#39;ll show you what that is and how to solve it",
      },
    ],
  },
  {
    chapter: "Rely on Abstractions (Dependency Injection and Protocols)",
    summary:
      "Avoid directly instantiating concrete classes within methods. Instead, use dependency injection to pass instances and leverage abstractions like protocols or abstract base classes to decouple code, improve flexibility, and facilitate testing by enabling the use of mock objects.",
    transcript: [
      {
        end: 626.72,
        start: 563.68,
        text: "the fourth bad practice that you don&amp;#39;t rely on abstractions basically directly calling methods constructing objects from other classes Within a method or a function here you see an example of that I have an order class that has a customer email a product ID and a quantity very basic and they also have an SMTP email service which is used to connect to a server and then sending an email to a customer then I have a process order function that creates this email service makes the connection and then sends an email to the customer about a particular order and then there&amp;#39;s a simple main function that creates an order and cost process order so let me run this then well this is what we get my order has been processed the issue with creating the email service object here is that it removes a lot of flexibility from the process order function because now we can only use it with this very specific email service it also makes it a lot harder to test this function because every time I call it it creates an actual email service and sends an actual email which is not ideal especially if you&amp;#39;re the recipient of this particular order&amp;#39;s email address what you can do in objectoriented code is that you make sure that creating an object and using an object doesn&amp;#39;t happen in the same place so on this case you want to take this line of code where you create the email service and move that out of process order so good place is then in the main function and then of course process order needs an email service as an",
      },
      {
        end: 626.72,
        start: 563.839,
        text: "argument like so and now we can simply create it here in the main function and then I can pass it along as an argument like so so let&amp;#39;s run this just to make sure this still does exactly the same thing and it does now it&amp;#39;s already easier to change things because I could for example create a subass of s SMTP email servers and change things and then pass that to process order that would work but an even better solution than supplying the email service here is to actually use an abstraction before I do that one more change I&amp;#39;m going to make to this code is that actually I think connecting to the server is not something that should happen in process order we could actually do that here and then process order only deals with actually sending the email and we probably want to add a few lines here as well such as marking an order as processed or something like that but what you can do with abstractions is that we can now make process order independent from the sntp email service and we can do that in Python by for example using a protocol",
      },
      {
        end: 1002.88,
        start: 627.24,
        text: "class and then I&amp;#39;m going to create a new class that&amp;#39;s called that email service which is a protocol class and that has a send email method and here I&amp;#39;m instead of passing an SMTP email service I&amp;#39;m simply passing an email service protocol and now this still does exactly the same I basically only changed the type annotations right and I introduced this extra class but now process order can get any type of email service I could create an IMAP email service that works differently as long as it has a send email method we&amp;#39;re good to go and that&amp;#39;s also what process order relies on you can also use an abstract Base Class for that in Python the general idea is that these things serve as sort of contract and interface and once you have that it&amp;#39;s easier to replace it with something else so for example if you need to write a test for process order I could simply create a mock email service and supply that to the process order function and it don&amp;#39;t need to create an actual email service",
      },
    ],
  },
  {
    chapter: "Importance of Encapsulation",
    summary:
      "Implement encapsulation to hide implementation details and maintain internal consistency. Use methods and properties to control access and modification of internal variables. However, for simple data-focused classes (data classes), direct attribute access can be more practical.",
    transcript: [
      {
        end: 1132.679,
        start: 1002.88,
        text: "the fifth bad practice is do not have encapsulation if you have a class in this case there&amp;#39;s a bank account class that has a balance and the way that we work with the bank account in this example is that we directly modify the balance we subtract 50 we add 100 encapsulation means that you hide implementation details from the outside world this is what methods properties allow you to do in a class so if we allow other code to directly modify the internal representation in this case that&amp;#39;s the balance then that can can lead to all sorts of problems for example I could now simply subtract a much higher amount because we&amp;#39;re directly modifying it there is no check nothing but of course if there is a balance of 100 I shouldn&amp;#39;t be able to take out 150 unless we also have a system for loans and that kind of stuff instead of modifying the balance directly we can also create an encapsulated version of this bank account by for example first putting an underscore in front of B bance so that it&amp;#39;s clear to the user of the class that underscore balance is something internal that we&amp;#39;re not supposed to be using in languages like Java you can add a protected or a private modifier for uh instance variables like this python doesn&amp;#39;t have this but at least this is something that you can do it&amp;#39;s not a guarantee you can actually still change it but at least we indicate in the code that this is not supposed to be changed directly now the second thing that we can do is add a let&amp;#39;s say a property balance and that actually gives us the value of the balance so now we can still print the balance of the account the second thing that I&amp;#39;m going to do is add a withdraw method so we Supply an amount and then we withdraw it from the balance but of course we only do that if there is enough balance so if the amount is higher than the balance then we raise a value error and then we can also do a deposit which works in a much similar way there we simply add the amount to the balance but we of course also want to make sure that the amount is actually positive so if the amount is less than zero actually zero is I guess allowed that&amp;#39;s possible but if it&amp;#39;s less than zero then we raise a value eror that must be positive and then instead of directly modifying it here we simply call these methods so we have withdraw and we have deposits like so let me run this to see what happens so yeah it prints the current balance which is 75 so now I have encapsulated the internal representation of the balance which is this particular instance variables and outside of that class we use methods and properties to interact with it the nice thing about this approach is that we can add these types of validation so that we ensure an internal consistency of a bank account instance which also makes it easier to find bugs another way this can be helpful is perhaps on the outside we still want to work with these integer values but internally we may want to use a decimal value right so then in this case we can simply change the internal representation we change the code here so that withdrawn and deposit work with integers and we&amp;#39;re good to go we don&amp;#39;t need to change anything in the main function or another example of why you want to encapsulate something is let&amp;#39;s say you interact with the database and you want to store a field in the database that contains Json data well perhaps your relational database doesn&amp;#39;t support that so you need to store it as a string so then your class that&amp;#39;s kind of an omm layer on top of a table on a database can contain a getter and a Setter that take Json data and then store it internally as a string so you use a parser and you use a stringify method to turn J into string and vice versa so there&amp;#39;s lots of reasons why you want to use encapsulation now there&amp;#39;s also a situation where you don&amp;#39;t want to have encapsulation and that&amp;#39;s if you have a very data focused class in this case I have a person class a person simply has a name and an age that&amp;#39;s it and I&amp;#39;ve encapsulated name and age here right there I have an underscore but if you look at how I modify them I have get name set name get age that age nothing is happening here because person is really nothing more than just a container for some data so the encapsulation here serves no purpose except for me getting painful fingers for typing this code all the time and this is something I commonly see especially in uh my older Java code where I actually did this a lot and I always created like a bunch of getter and Setter it took me a lot of time to write code nowadays I&amp;#39;m less inclined to do that so instead of doing this with the gter and sets if you really don&amp;#39;t need that type of specific behavior of validation you can just use direct attribute access so in this case what I would actually do is change person into a data",
      },
      {
        end: 1023.519,
        start: 1007.319,
        text: "class and in that case person would just have a name and an age and then I can throw away all of this code there we go and now I can simply access these attributes",
      },
      {
        end: 1132.679,
        start: 1030.88,
        text: "directly like so so this very much simplifies the code this is what happens when we run this so even though person is now less encapsulated it&amp;#39;s also very basic data representation so we don&amp;#39;t really need all that extra over engineered boiler plate code",
      },
    ],
  },
  {
    chapter: "Avoid Overusing Mixins (Favor Composition)",
    summary:
      "Overusing mixins leads to complicated and hard-to-trace class hierarchies. Consider using composition instead. If classes are simple, functions might be an even better alternative.",
    transcript: [
      {
        end: 1483.64,
        start: 1132.679,
        text: "and by the way if you enjoy these types of discussions make sure to join my Discord server at discord. iron. codes it&amp;#39;s a really awesome Community love for you to join the final bad practice I want to talk about is mixin yes overusing mixins to add functionality to existing classes can really lead to complicated and hard to trace class hierarchies for example here I have an order class I have a log mix in which has a log methods I have a save mix in which has a save method and then I&amp;#39;m mixing in those features into other classes like processing in order and counseling an order so I&amp;#39;m using these mixins here to add small pieces of functionality across multiple classes the problem with mixins like this that it can really easily create very complex brittle hierarchies like I mentioned before inheritance is one of the strongest types of coupling there is and now we&amp;#39;re even using multiple inheritance in some languages that&amp;#39;s even forbidden to do you&amp;#39;re not even allowed to do that because it leads to all sorts of problems and actually in many cases you can come up with a solution that doesn&amp;#39;t use mixin but uses composition instead so for example here the way to solve this if you want to keep these classes you could also change this to functions but if you want to keep these classes then you could change process order to not use mixins like this but instead have an",
      },
      {
        end: 1140.72,
        start: 1132.76,
        text: "initializer that gets a saver and a logger",
      },
      {
        end: 1144.32,
        start: 1140.919,
        text: "and does this need",
      },
      {
        end: 1169.08,
        start: 1144.96,
        text: "self and then we store them as instance variables and then here we do this and we call the methods on these instances that we stored as part of the class so instead of using mixins and inheritance we&amp;#39;re simply storing the instances as part of the object I can do the same for cancel order",
      },
      {
        end: 1174.679,
        start: 1169.64,
        text: "like so and I&amp;#39;m going to remove the inheritance",
      },
      {
        end: 1181.12,
        start: 1177.919,
        text: "relationship like",
      },
      {
        end: 1230.08,
        start: 1181.72,
        text: "so and then what we&amp;#39;re do here is we create the logger we also create the saver and then we pass them to these objects when we create them like so let me run this to see what happens so we get some logs and we get a message that the data is saved and then of course you probably want to change the names because this is no longer a mix in so let&amp;#39;s change this to logger and here same let&amp;#39;s change this to saver like so that&amp;#39;s already a bit better in this case actually I wouldn&amp;#39;t use classes at all because these classes are like really simple so what I would do is not have these logger and saver classes but I would simply have my functions like so which is of course much simpler",
      },
      {
        end: 1252.039,
        start: 1230.679,
        text: "and for these classes we can actually do the same thing so instead of creating instances and storing the saver and the logger we can also pass the functions so then let&amp;#39;s call this process order and we&amp;#39;re going to pass a saver and a",
      },
      {
        end: 1263.159,
        start: 1254.32,
        text: "logger like so and for cancelling an order we can do actually the same thing so let me copy",
      },
      {
        end: 1271.52,
        start: 1266.559,
        text: "that let&amp;#39;s also add the saver and the logger",
      },
      {
        end: 1483.64,
        start: 1274.52,
        text: "here this is no longer needed so we now have basically four functions and that&amp;#39;s it so now I don&amp;#39;t have to create all these objects but I can simply do process order and then I pass the order and the save function and the log function and then I&amp;#39;m doing a cancel order that also gets the order and the functions so let me run this this will have exactly the same effect now of course here the example is really basic so this allows me to do that it may not always be possible to throw out all the class and replace them by functions let&amp;#39;s still clean this code up a little bit because I don&amp;#39;t like that I don&amp;#39;t have type annotations here so what I&amp;#39;m going to do since uh python 3.2 there is a nice way to define a type Alias so I&amp;#39;m going to import from the typing module the callable type which is what a function is and then I&amp;#39;m going to create a type Alias so we have a save function which is a callable that gets no arguments and returns none that&amp;#39;s the signature of the save function and I can also create a low function that&amp;#39;s also Gable it gets a string and and returns num so now I can supply those types here so sa is the save function and logger is the log function like so and I&amp;#39;m going to do the same thing for cancel order like so let&amp;#39;s run this one more time and yes we have exactly the same result so here I went from code that had pretty complex inheritance hierarchy to a really simple setup with just a few functions and this is also why I like functions so much they really lead to a lot simpler code and you don&amp;#39;t always need objectoriented code now you might say okay so bad practice of objectoriented code is that then writing objectoriented code instead of functions it&amp;#39;s not really what I want to say I think there is definitely cases where classes can be helpful for example if you have data and methods that work on the data and you need multiple instances of that then a class definitely makes sense I also like to use classes for these sort of basic data structures as opposed to let&amp;#39;s say an unstructured dictionary because this helps me in the IDE for quickly pointing out errors while I&amp;#39;m trying to access the fields and with dictionaries well I may add a typo and you will only find out when you try to run the code so I like using classes for this as well but overall don&amp;#39;t use a class if you can use a function or module instead avoid deep inheritance hierarchies use abstractions to De copy your code like protocol Al or abct based classes and make sure you encapsulate Behavior but don&amp;#39;t overdo it and add a bunch of Getters and Setters if it&amp;#39;s just a simple data object and finally if you can use composition instead of mixin now I&amp;#39;d like to hear from you what are your thoughts on these bad practices do you agree do you have any tips for writing better objectoriented code let me know in the comments below if you do prefer more functional style of coding there are a couple of really helpful Concepts you need to know about like higher order functions and partial function application if you want to learn more about those and how to use them in Python check out this video next thanks for watching and see you next time",
      },
    ],
  },
]

export default function VideoPage() {
  const params = useParams()
  const id = params.id as string
  const [contentTable] = useState(CONTENT_TABLE)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="transition-all duration-200 hover:-translate-y-1 hover:bg-background/40 group">
            <CardHeader className="pb-2">
              <CardTitle className="group-hover:text-primary group-hover:brightness-125">ADD TITILE RIGHT HERE!!!!</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative pt-[56.25%]">
                <iframe
                  src={`https://www.youtube.com/embed/${id}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Transcript Dropdown */}
          <Card
            className={`mt-6 transition-all duration-200 hover:-translate-y-1 hover:bg-background/40 group ${isFullscreen ? "fixed inset-0 z-50 m-0 max-h-none rounded-none" : "max-h-[400px] overflow-auto"}`}
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="group-hover:text-primary group-hover:brightness-125">Video Transcript</CardTitle>
              <button
                className="p-1 rounded-md hover:bg-muted"
                onClick={() => setIsFullscreen(!isFullscreen)}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {contentTable.map((chapter, index) => (
                  <AccordionItem key={index} value={`chapter-${index}`}>
                    <AccordionTrigger>
                      <div className="flex flex-col items-start text-left">
                        <div className="font-semibold">{chapter.chapter}</div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className={isFullscreen ? "max-h-none" : "max-h-60 overflow-y-auto"}>
                      <div className="space-y-4">
                        {chapter.transcript.map((item, idx) => (
                          <div key={idx} className="flex gap-3 text-sm">
                            <span className="text-muted-foreground whitespace-nowrap">
                              {formatTimestamp(item.start)} - {formatTimestamp(item.end)}
                            </span>
                            <p>{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div>
          <ContentCard contentTable={contentTable} />
        </div>
      </div>
    </div>
  )
}
